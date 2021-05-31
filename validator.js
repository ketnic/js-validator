class Validator {
  constructor() {
    this._errors = [];
  }

  get Errors() {
    return this._errors;
  }

  _addError(message) {
    this._errors.unshift(message);
  }

  isValid(schema = {}, dataToValidate) {
    let schemas;
    let isOneOf = false;
    if (schema.hasOwnProperty('type')) {
      return this.validateType(schema, dataToValidate);
    }

    if (schema.hasOwnProperty('oneOf')) {
      schemas = schema.oneOf;
      isOneOf = true;
    }
    else if (schema.hasOwnProperty('anyOf')) { 
      schemas = schema.anyOf;
    }
    else {
      return false;
    }
    const count = schemas
      .map(schema => this.isValid(schema, dataToValidate))
      .reduce((acc, cur) => acc + cur);
    const result = isOneOf && count == 1 || !isOneOf && count > 0;
    
    if (count == 0) {
      this._addError('None schemas are valid');
      return false;
    }
    if (count > 1 && isOneOf) {
      this._addError('More than one shema valid for this data');
      return false;
    }
    return result;
  }

  validateType(schema, value) { 
    if (schema.nullable === true && value == null) {
      return true;
    }
    else if (schema.nullable === false && value == null){
      this._addError('Value is null, but nullable false');
      return false;
    }

    switch (schema.type) {
      case 'number':
        return this.validateDataType(schema, value) && this.isValidNumber(schema, value);
      case 'string':
        return this.validateDataType(schema, value) && this.isValidString(schema, value);
      case 'array':
        return this.validateDataType(schema, value) && this.isValidArray(schema, value);
      case 'object':
        return this.validateDataType(schema, value) && this.isValidObject(schema, value);
      default:
        this._addError('Unknown type');
        return false;
    }
  }

  validateDataType(schema, data) {
    if (typeof data === schema.type && !Array.isArray(data) || schema.type === 'array' && Array.isArray(data)) {
      return true;
    }
    this._addError('Type is incorrect');
    return false;
  }

  isValidNumber(schema, value) {
    let minValue = schema.minimum || Number.MIN_SAFE_INTEGER;
    let maxValue = schema.maximum || Number.MAX_SAFE_INTEGER;
    if (value < minValue) {
      this._addError('Value is less than it can be');
      return false;
    }
    if (value > maxValue) {
      this._addError('Value is greater than it can be');
      return false;
    }
    if (schema.hasOwnProperty('enum') && !schema.enum.includes(value)) {
      this._addError('The enum does not support value');
      return false;
    }
    return true;
  }

  isValidString(schema, value) {
    let minLength = schema.minLength || Number.MIN_SAFE_INTEGER;
    let maxLength = schema.maxLength || Number.MAX_SAFE_INTEGER;
    if (value.length < minLength) {
      this._addError('Too short string');
      return false;
    }
    if (value.length > maxLength) {
      this._addError('Too long string');
      return false;
    }
    if (schema.hasOwnProperty('pattern') && !schema.pattern.test(value) ) {
      this._addError('String does not match pattern');
      return false;
    }
    if (schema.hasOwnProperty('enum') && !schema.enum.includes(value)) {
      this._addError('The enum does not support value');
      return false;
    }
    if (schema.hasOwnProperty('format')) {
      switch (schema.format) {
        case 'email':
          let email = /^[^\s@]+@[^\s@]+$/;
          if (!email.test(value)) {
            this._addError('Format of string is not valid');
            return false;
          }
          break;
        case 'date':
          let date = /^(19|20)\d\d([- /.])(0[1-9]|1[012])\2(0[1-9]|[12][0-9]|3[01])$/;
          if (!date.test(value)) {
            this._addError('Format of string is not valid');
            return false;
          }
          break;
        default:
          return false;
      }
    }
    return true;
  }

  isValidArray(schema, value) {
    let minItems = schema.minItems || Number.MIN_SAFE_INTEGER;
    let maxItems = schema.maxItems || Number.MAX_SAFE_INTEGER;
    if (value.length < minItems) {
      this._addError('Items count less than can be');
      return false;
    }
    if (value.length > maxItems) {
      this._addError('Items count more than can be');
      return false;
    }
    if (schema.hasOwnProperty('items')) {
      const isArray = Array.isArray(schema.items);
      for (const i in value) {
        if (isArray) {
          if (!this.validateType(schema.items[i], value[i])) {
            return false;
          }
        }
        else {
          if (!this.validateType(schema.items, value[i])) {
            return false;
          }
        }
      }
      return true;
    }
    if (schema.hasOwnProperty('contains') && !value.includes(schema.contains)) { //сделать как в enum?
      const contains = JSON.stringify(schema.contains);
      const values = value.map(x => JSON.stringify(x));
      if (!values.includes(contains)) {
        this._addError('Must contain a value, but does not');
        return false;
      }
    }
    if (schema.hasOwnProperty('uniqueItems') && schema.uniqueItems) {
      const uniqueItems = new Set(value.map(x => JSON.stringify(x)));
      if (!(value.length == uniqueItems.size)) {
        this._addError('Elements of array not unique');
        return false;
      }
    }
    if (schema.hasOwnProperty('enum')) {
      const itemEnum = schema.enum.map(x => JSON.stringify(x));
      const array = JSON.stringify(value);
      if (!itemEnum.includes(array)) {
        this._addError('The enum does not support one of array elements');
        return false;
      }
    }
    return true;
  }

  isValidObject(schema, value) {
    let minProperties  = schema.minProperties || Number.MIN_SAFE_INTEGER;
    let maxProperties  = schema.maxProperties || Number.MAX_SAFE_INTEGER;
    if (Object.keys(value).length < minProperties) {
      this._addError('Too few properties in object');
      return false;
    }
    if (Object.keys(value).length > maxProperties) {
      this._addError('Too many properties in object');
      return false;
    }
    if (schema.hasOwnProperty('required')) {
      for (const prop of schema.required) {
        if (!value.hasOwnProperty(prop)) {
          this._addError('Property required, but value is undefined');
          return false;
        }
      }
    }
    if (schema.hasOwnProperty('properties')) {
      for (const key of Object.keys(schema.properties)) {
        if (!this.validateType(schema.properties[key], value[key])){
          return false;
        }
      }
    }
    if (schema.hasOwnProperty('additionalProperties') && !schema.additionalProperties && (Object.keys(value).length > Object.keys(schema.properties).length)) {
      this._addError('An object cant have additional properties');
      return false;
    }
    return true;
  }
}
