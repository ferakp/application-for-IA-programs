export class TextFieldFormatValueConverter {
  toView(value, params) {
    const { firstLetterUpperCase } = params;
    if (value && firstLetterUpperCase && (value[0] !== value[0].toUpperCase())) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value;
  }

  fromView(value, params) {
    const { firstLetterUpperCase } = params;
    if (value && firstLetterUpperCase && (value[0] !== value[0].toUpperCase())) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value;
  }
}
