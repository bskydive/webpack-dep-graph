export function logEmpty(line: string, data: string) {
	if (!data) {
		console.warn({
			msg: 'EMPTY data',
			line,
			data,
		})
	}
}

export function log(...args: any) {
    console.info(...args)
}
