//declare module 'toyunda2ass' {

	export interface ToyundaData {
		lyrics: string[],
		frames: string[]
	}
	export function splitTime(time: string): ToyundaData
	export function findFPS(videofile: string, ffmpegPath?: string): Promise<number>
	export function convertToASS(ToyundaData: ToyundaData, fps: number): string
//}
