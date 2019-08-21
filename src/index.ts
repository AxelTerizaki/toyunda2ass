#!/usr/bin/env node
import { asyncExists, asyncReadFile, msToAss, clone } from './utils';
import { ToyundaData } from './types';
import stringify from 'ass-stringify';
import execa from 'execa';
const ass = require('./assTemplate');

/** Split a generated toyunda file (txt) into frm and lyr data. Also formats it out of undesired data */
export function splitTime(txt: string): ToyundaData {
	const lyr = [];
	const frm = [];
	let position = '';
	for (const line of txt.split('\n')) {
		if (line === '# --- LYRICS - GENERATE AGAIN AFTER YOU EDIT ---') {
			position = 'lyr';
			continue;
		}
		if (line === '# --- SUB - DO NOT EDIT HERE - MODIFICATIONS WILL BE LOST ---') {
			position = 'sub';
			continue;
		}
		if (line === '# --- TIMING - GENERATE AGAIN AFTER YOU EDIT ---') {
			position = 'frm';
			continue;
		}
		if (position === 'lyr') {
			const lyrics = line.substr(2, line.length - 2);
			if (lyrics.startsWith('%')) continue;
			lyr.push(lyrics);
		}
		if (position === 'frm') {
			const frames = line.substr(2, line.length - 2);
			if (frames.startsWith('#')) continue;
			frm.push(frames.trim());
		}
	}
	return {
		lyrics: lyr,
		frames: frm
	}
}

export async function findFPS(videoFile: string): Promise<number> {
	try {
		const result = await execa('ffmpeg', ['-i', videoFile, '-vn', '-f','null', '-'], { encoding : 'utf8' });
		const outputArray = result.stderr.split(' ');
		const indexFPS = outputArray.indexOf('fps');
		let fps = 0;
		if (indexFPS > -1) {
			fps = parseFloat(outputArray[indexFPS - 1]);
		} else {
			throw 'No FPS data found';
		}
		return fps;
	} catch(err) {
		throw `Error starting ffmpeg : ${err}`;
	}
}

/** Convert Toyunda data (frm+lyr) to ASS */
export function convertToASS(time: ToyundaData, fps: number): string {
	// Going to read lyrics data and increment an index to see which frame line we should be on.
	const dialogue = [];
	let frmPos = 0;
	for (let line of time.lyrics) {
		// Ignore lyr header lines (%)
		if (line.startsWith('%')) continue;
		// Strip lines of carriage returns, you never know.
		line = line.replace(/\r/g,'')
		// At the start of each line, take the first number of the frame data we're currently on
		const firstFrame = time.frames[frmPos].split(' ')[0];
		// We apply a 0.9 second delay in advance so the line appears before it is to be sung
		let startMs = Math.floor((+firstFrame / fps) * 1000) - 1000;
		if (startMs < 0) startMs = 0;
		let ASSLine = ['{\\fad(90,20)\\k90}'];
		for (const syl of line.split('&')) {
			// First item is ignored, it's what's before the first syllabe marker. Also ignored are % headers in lyr files
			if (syl === '') continue;
			const firstSylFrame = time.frames[frmPos].split(' ')[0];
			const lastSylFrame = time.frames[frmPos].split(' ')[1];
			// Duration of a syllabe in 1/100 second
			const duration = Math.floor(((+lastSylFrame - +firstSylFrame) / fps) * 100);
			ASSLine.push('{\\k' + duration + '}' + syl);
			frmPos++;
		}
		// To determine stopTime, we pick frame data before the current one since it's supposed to be on the same line
		// We also add 900ms to the end of the line so it stays a bit longer on screen
		const lastFrameInLine = time.frames[frmPos - 1].split(' ')[1];
		const stopMs = Math.floor((+lastFrameInLine / fps) * 1000) + 100;
		// Let's construct the line.

		const event = clone(ass.dialogue);
		event.value.Start = msToAss(startMs);
		event.value.End = msToAss(stopMs);
		event.value.Text = ASSLine.join('');
		// Add it to our kara
		dialogue.push(clone(event));
	}
	const events = clone(ass.events);
	events.body = events.body.concat(dialogue);
	return stringify([ass.scriptInfo, ass.styles, events]);
}

async function mainCLI() {
	if (!process.argv[2]) {
		throw `Toyunda2ass - Convert Toyunda karaoke to ASS files
		Usage: toyunda2ass myfile.frm myfile.lyr fps
		Output goes to stdout
		`;
	}
	const frmFile = process.argv[2];
	const lyrFile = process.argv[3];
	let fps = +process.argv[4];
	if (!fps || isNaN(fps)) {
		// Trying to guess FPS from video file
		fps = await findFPS(frmFile.replace('.frm', '.avi'));
	}
	if (!await asyncExists(frmFile)) throw `File ${frmFile} does not exist`;
	if (!await asyncExists(lyrFile)) throw `File ${lyrFile} does not exist`;
	const lyr = await asyncReadFile(lyrFile, 'utf8');
	const frm = await asyncReadFile(frmFile, 'utf8');

	return convertToASS({lyrics: lyr.split('\n'), frames: frm.split('\n')}, fps);
}

if (require.main === module) mainCLI()
	.then(data => console.log(data))
	.catch(err => console.log(err));
