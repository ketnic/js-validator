let validator;

describe('Validator', () => {
  describe('Общее', () => {
    beforeEach(() => {
      validator = new Validator();
    });

    it('Должен проверять на null', () => {
      const isValid = validator.isValid({
        type: 'number',
        nullable: true
      }, null);

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если передан неизвестный тип', () => {
      const isValid = validator.isValid({
        type: 'test'
      }, 321);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Unknown type');
    });

    it('Должен добавлять ошибку, если значение null, но nullable - false', () => {
      const isValid = validator.isValid({
        type: 'number',
        nullable: false
      }, null);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Value is null, but nullable false');
    });

    it('Должен проверять на соответствие anyOf', () => {
      const isValid = validator.isValid({
        anyOf: [
          {
            type: 'number'
          },
          {
            type: 'string'
          }
        ]
      }, '654');

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если значение не соответствует ни одной схеме из anyOf', () => {
      const isValid = validator.isValid({
        anyOf: [
          {
            type: 'number'
          },
          {
            type: 'string'
          }
        ]
      }, []);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('None schemas are valid');
    });

    it('Должен проверять на соответствие oneOf', () => {
      const isValid = validator.isValid({
        oneOf: [
          {
            type: 'object'
          },
          {
            type: 'string'
          }
        ]
      }, '654');

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если значение соответствует больше чем одной схеме из oneOf', () => {
      const isValid = validator.isValid({
        oneOf: [
          {
            type: 'object',
            additionalProperties: false,
            properties: {
              t: {
                type: 'number'
              }
            }
          },
          {
            type: 'object'
          }
        ]
      }, {t: 1});

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('More than one shema valid for this data');
    });

    it('Должен добавлять ошибку, если значение не соответствует ни одной схеме из oneOf', () => {
      const isValid = validator.isValid({
        oneOf: [
          {
            type: 'object',
            additionalProperties: false,
            properties: {
              t: {
                type: 'number'
              }
            }
          },
          {
            type: 'object'
          }
        ]
      }, []);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('None schemas are valid');
    });
  });

  describe('Числа', () => {
    beforeEach(() => {
      validator = new Validator();
    });

    it('Должен проверять тип', () => {
      const isValid = validator.isValid({
        type: 'number'
      }, 1);

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если тип неверный', () => {
      const isValid = validator.isValid({
        type: 'number'
      }, '231');

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Type is incorrect');
    });

    it('Должен проверять на минимальное значение', () => {
      const isValid = validator.isValid({
        type: 'number',
        minimum: 5.2
      }, 5.5);

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если значение меньше минимума', () => {
      const isValid = validator.isValid({
        type: 'number',
        minimum: 5
      }, 1);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Value is less than it can be');
    });

    it('Должен проверять на максимальное значение', () => {
      const isValid = validator.isValid({
        type: 'number',
        maximum: 5
      }, 3);

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если значение больше максимума', () => {
      const isValid = validator.isValid({
        type: 'number',
        maximum: 5
      }, 6);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Value is greater than it can be');
    });

    it('Должен проверять на соответствие возможным значениям', () => {
      const isValid = validator.isValid({
        type: 'number',
        enum: [5, 2.76, 4]
      }, 2.76);

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если значение не из перечисленных возможных', () => {
      const isValid = validator.isValid({
        type: 'number',
        enum: [1, 2, 3]
      }, 4);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('The enum does not support value');
    });
  });

  describe('Строки', () => {
    beforeEach(() => {
      validator = new Validator();
    });

    it('Должен проверять тип', () => {
      const isValid = validator.isValid({
        type: 'string'
      }, 'hghgfg');

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если тип неверный', () => {
      const isValid = validator.isValid({
        type: 'string'
      }, true);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Type is incorrect');
    });

    it('Должен проверять максимальную длину', () => {
      const isValid = validator.isValid({
        type: 'string',
        maxLength: 5
      }, '123');

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если длина строки больше максимальной', () => {
      const isValid = validator.isValid({
        type: 'string',
        maxLength: 5
      }, '123456');

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Too long string');
    });

    it('Должен проверять минимальную длину', () => {
      const isValid = validator.isValid({
        type: 'string',
        minLength: 5
      }, '123456');

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если длина строки меньше минимальной', () => {
      const isValid = validator.isValid({
        type: 'string',
        minLength: 5
      }, '123');

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Too short string');
    });

    it('Должен проверять строку по регулярному выражению', () => {
      const isValid = validator.isValid({
        type: 'string',
        pattern: /\d{1,2}/
      }, '12');

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если строка не соответствует переданному регулярному выражению', () => {
      const isValid = validator.isValid({
        type: 'string',
        pattern: /\d{1,2}/
      }, 'uygu');

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('String does not match pattern');
    });

    it('Должен проверять на соответствие возможным значениям', () => {
      const isValid = validator.isValid({
        type: 'string',
        enum: ['321', 'das', 'cxz']
      }, 'das');

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если значение не из перечисленных возможных', () => {
      const isValid = validator.isValid({
        type: 'string',
        enum: ['321', 'das', 'cxz']
      }, 'ytr');

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('The enum does not support value');
    });

    describe('Форматы', () => {
      it('Должен проверять, что строка это email', () => {
        const isValid = validator.isValid({
          type: 'string',
          format: 'email'
        }, 'i@tmn72.ru');

        expect(isValid).toBeTrue();
      });

      it('Должен добавлять ошибку, если строка не email', () => {
        const isValid = validator.isValid({
          type: 'string',
          format: 'email'
        }, 'kjhg');

        expect(isValid).toBeFalse();
      });

      it('Должен проверять, что строка это дата', () => {
        const isValid = validator.isValid({
          type: 'string',
          format: 'date'
        }, '2019-02-23');

        expect(isValid).toBeTrue();
      });

      it('Должен добавлять ошибку, если строка не дата', () => {
        const isValid = validator.isValid({
          type: 'string',
          format: 'date'
        }, 'sttrrr');

        expect(isValid).toBeFalse();
        expect(validator.Errors[0]).toBe('Format of string is not valid');
      });
    });
  });

  // describe('Boolean', () => {
  //   beforeEach(() => {
  //     validator = new Validator();
  //   });

  //   it('Должен проверять на null', () => {
  //     const isValid = validator.isValid({
  //       type: 'boolean',
  //       nullable: true
  //     }, null);

  //     expect(isValid).toBeTrue();
  //   });

  //   it('Должен проверять тип', () => {
  //     const isValid = validator.isValid({
  //       type: 'boolean'
  //     }, false);

  //     expect(isValid).toBeTrue();
  //   });

  //   it('Должен добавлять ошибку, если тип неверный', () => {
  //     const isValid = validator.isValid({
  //       type: 'boolean'
  //     }, []);

  //     expect(isValid).toBeFalse();
  //     expect(validator.Errors[0]).toBe('Type is incorrect');
  //   });
  // });

  describe('Массивы', () => {
    beforeEach(() => {
      validator = new Validator();
    });

    it('Должен проверять на null', () => {
      const isValid = validator.isValid({
        type: 'array',
        nullable: true
      }, null);

      expect(isValid).toBeTrue();
    });

    it('Должен проверять тип', () => {
      const isValid = validator.isValid({
        type: 'array'
      }, [1, 2, 3]);

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если тип неверный', () => {
      const isValid = validator.isValid({
        type: 'array'
      }, {});

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Type is incorrect');
    });

    it('Должен проверять на максимальное количество элементов', () => {
      const isValid = validator.isValid({
        type: 'array',
        maxItems: 4
      }, [1, 2, 3]);

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если количество элементов больше максимального', () => {
      const isValid = validator.isValid({
        type: 'array',
        maxItems: 2
      }, [1, 2, 3, 4]);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Items count more than can be');
    });

    it('Должен проверять на минимальное количество элементов', () => {
      const isValid = validator.isValid({
        type: 'array',
        minItems: 2
      }, [1, 2, 3]);

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если количество элементов меньше минимального', () => {
      const isValid = validator.isValid({
        type: 'array',
        minItems: 5
      }, [1, 2, 3, 4]);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Items count less than can be');
    });

    it('Должен проверять тип элементов', () => {
      const isValid = validator.isValid({
        type: 'array',
        items: {
          type: 'number'
        }
      }, [1, 2, 3]);

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если тип элементов неверный', () => {
      const isValid = validator.isValid({
        type: 'array',
        items: {
          type: 'string'
        }
      }, [1, 2, 3, 4]);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Type is incorrect');
    });

    it('Должен проверять элементы на несколько типов', () => {
      const isValid = validator.isValid({
        type: 'array',
        items: [
          {
            type: 'number'
          },
          {
            type: 'string'
          }
        ]
      }, [1, 'hi']);

      expect(isValid).toBeTrue();
    });

    it('Должен проверять вхождение элемента', () => {
      const isValid = validator.isValid({
        type: 'array',
        contains: 1
      }, [1, 2, 3]);

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если указанного элемента нет в массиве', () => {
      const isValid = validator.isValid({
        type: 'array',
        contains: 5
      }, [1, 2, 3, 4]);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Must contain a value, but does not');
    });

    it('Должен проверять на уникальность элементов', () => {
      const isValid = validator.isValid({
        type: 'array',
        uniqueItems: true
      }, [[1], 2, 5]);

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если элементы не уникальны', () => {
      const isValid = validator.isValid({
        type: 'array',
        uniqueItems: true
      }, [{t: 'e'}, {t: 'e'}, 3, 4]);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Elements of array not unique');
    });

    it('Должен проверять на соответствие переданным значениям', () => {
      const isValid = validator.isValid({
        type: 'array',
        enum: [[1], [{e: 'hi'}], [1,2]]
      }, [{e: 'hi'}]);

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если значение не из перечисленных возможных', () => {
      const isValid = validator.isValid({
        type: 'array',
        enum: [[1], [{e: 'hi'}], [1,2]]
      }, [765]);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('The enum does not support one of array elements');
    });
  });

  describe('Объекты', () => {
    beforeEach(() => {
      validator = new Validator();
    });

    it('Должен проверять на null', () => {
      const isValid = validator.isValid({
        type: 'object',
        nullable: true
      }, null);

      expect(isValid).toBeTrue();
    });

    it('Должен проверять тип', () => {
      const isValid = validator.isValid({
        type: 'object'
      }, {});

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если тип неверный', () => {
      const isValid = validator.isValid({
        type: 'object'
      }, []);

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Type is incorrect');
    });

    it('Должен проверять на максимальное число свойств', () => {
      const isValid = validator.isValid({
        type: 'object',
        maxProperties: 1
      }, {e: 1});

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если количество свойств больше максимального', () => {
      const isValid = validator.isValid({
        type: 'object',
        maxProperties: 1
      }, {e: 1, r: 3});

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Too many properties in object');
    });

    it('Должен проверять на минимальное число свойств', () => {
      const isValid = validator.isValid({
        type: 'object',
        minProperties: 2
      }, {e: 1, a: '7'});

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если количество свойств меньше минимального', () => {
      const isValid = validator.isValid({
        type: 'object',
        minProperties: 2
      }, {e: 1});

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Too few properties in object');
    });

    it('Должен проверять на наличие обязательных свойств', () => {
      const isValid = validator.isValid({
        type: 'object',
        required: ['e', 'a']
      }, {e: 1, a: '7'});

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если не передано обязательное свойство', () => {
      const isValid = validator.isValid({
        type: 'object',
        required: ['e', 'a']
      }, {e: 1});

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Property required, but value is undefined');
    });

    it('Должен проверять свойства объекта', () => {
      const isValid = validator.isValid({
        type: 'object',
        properties: {
          'a': {
            type: 'string'
          },
          't': {
            type: 'array',
            items: {
              type: 'number'
            }
          }
        }
      }, {a: 'qq', t: [1.2, 3, 4.4]});

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если значение свойства не соответствует схеме', () => {
      const isValid = validator.isValid({
        type: 'object',
        properties: {
          'a': {
            type: 'string'
          },
          't': {
            type: 'array',
            items: {
              type: 'number'
            }
          }
        }
      }, {a: 'qwe', t: [1, []]});

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('Type is incorrect');
    });

    it('Должен проверять на дополнительные свойства', () => {
      const isValid = validator.isValid({
        type: 'object',
        additionalProperties: false,
        properties: {
          e: {
            type: 'number'
          },
          a: {
            type: 'string'
          }
        }
      }, {e: 1, a: '7'});

      expect(isValid).toBeTrue();
    });

    it('Должен добавлять ошибку, если у объекта есть лишние свойства', () => {
      const isValid = validator.isValid({
        type: 'object',
        additionalProperties: false,
        properties: {
          e: {
            type: 'number'
          }
        }
      }, {e: 1, a: 'hi'});

      expect(isValid).toBeFalse();
      expect(validator.Errors[0]).toBe('An object cant have additional properties');
    });
  });
});
