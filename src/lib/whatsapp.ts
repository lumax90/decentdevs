export const whatsappCopy = {
  greeting: 'Merhaba! Aklındaki projeyi kısaca anlat, ilk fırsatta dönüş yapalım.',
  message: 'Merhaba Decent Devs! Bir projem hakkında görüşmek istiyorum.',
};

export function whatsappLink(value: string | undefined) {
  if (!value || /[^\d+()\s.-]/.test(value)) return null;
  const number = value.trim().replace(/[+()\s.-]/g, '').replace(/^00/, '');
  if (!/^[1-9]\d{7,14}$/.test(number)) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(whatsappCopy.message)}`;
}
