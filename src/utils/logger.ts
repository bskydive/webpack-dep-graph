export function logEmpty(line: string, data: string, ...args: any) {
	if (!data) {
		console.warn({
			msg: 'EMPTY data',
			line,
			data,
            ...args
		})
	}
}

export function log(...args: any) {
    console.info(...args)
}
