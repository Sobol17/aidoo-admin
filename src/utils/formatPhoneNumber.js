export const formatPhoneNumber = value => {
	if (!value) return ''

	// Убираем все нецифровые символы
	const numbers = value.replace(/\D/g, '')

	// Если номер начинается с 7, добавляем +
	if (value.startsWith('+7') || value.startsWith('7')) {
		if (numbers.length <= 1) return '+7'
		if (numbers.length <= 4) return `+7 (${numbers.slice(1)}`
		if (numbers.length <= 7)
			return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4)}`
		if (numbers.length <= 9)
			return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7)}`
		return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`
	}

	// Если номер начинается с других цифр
	if (numbers.length <= 3) return `+7 (${numbers}`
	if (numbers.length <= 6)
		return `+7 (${numbers.slice(0, 3)}) ${numbers.slice(3)}`
	if (numbers.length <= 8)
		return `+7 (${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`
	return `+7 (${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 8)}-${numbers.slice(8, 10)}`
}

export const validatePhone = value => {
	const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/
	return phoneRegex.test(value)
}

export const handlePhoneInput = value => {
	// Разрешаем только цифры, плюс, пробелы, скобки и дефис
	const cleanValue = value.replace(/[^\d\s()+\-]/g, '')
	return formatPhoneNumber(cleanValue)
}
