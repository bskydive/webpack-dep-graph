export function logEmpty(line: string, value: string, ...args: any) {
	if (!value) {
		console.warn({
			msg: "EMPTY data",
			line,
			value,
			data: { ...args },
		})
	}
}

export function log(...args: any) {
	console.info(...args)
}
