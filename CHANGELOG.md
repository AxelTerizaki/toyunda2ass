# CHANGELOG

## 1.0.8

- Detect CRLF on txt data and turns it into LF.
- Added ability to take just a txt as parameter containing frm+lyr files

## 1.0.7

- Do not add \k100 on first line if song begins at 00:00:00
- Correctly guess fps within ffmpeg output

## 1.0.6

- Forgot to modify findFPS type

## 1.0.5

- Made findFPS function accept a ffmpegPath parameter (defaults to 'ffmpeg')

## 1.0.2 -> 1.0.4

- Fixed various bugs about templates (see commits)

## 1.0.2

- Added proper type definitions when used as a module

