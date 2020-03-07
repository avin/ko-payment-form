import 'core-js/es/object/assign';
import 'core-js/es/global-this';
import 'core-js/es/promise';

import ko from 'knockout';
import creditCardType from 'credit-card-type';
import cardValidator from 'card-validator';
import { wait } from './helpers';

import './bindingHandlers/maskInput';
import './extenders/validation';

import alipayIcon from '../img/alipay.svg';
import amexIcon from '../img/american-express.svg';
import dinersIcon from '../img/diners-club.svg';
import discoverIcon from '../img/discover.svg';
import eloIcon from '../img/elo.svg';
import hipercardIcon from '../img/hipercard.svg';
import jcbIcon from '../img/jcb.svg';
import maestroIcon from '../img/maestro.svg';
import mastercardIcon from '../img/mastercard.svg';
import paypalIcon from '../img/paypal.svg';
import unionpayIcon from '../img/unionpay.svg';
import verveIcon from '../img/verve.svg';
import visaIcon from '../img/visa.svg';
import mirIcon from '../img/mir.svg';

// Иконки платежных систем
const icons = {
  alipay: alipayIcon,
  'american-express': amexIcon,
  'diners-club': dinersIcon,
  discover: discoverIcon,
  elo: eloIcon,
  hipercard: hipercardIcon,
  jcb: jcbIcon,
  maestro: maestroIcon,
  mastercard: mastercardIcon,
  paypal: paypalIcon,
  unionpay: unionpayIcon,
  verve: verveIcon,
  visa: visaIcon,
  mir: mirIcon,
};

// Описание viewModel платежной формы
function PaymentFormModel() {
  const self = this;

  // Каркас для всех полей
  function FormField({ value = '', maskOptions, validation } = {}) {
    this.value = ko.observable(value);
    this.maskOptions = maskOptions;

    if (validation) {
      this.value.extend({ validation });
      this.showValidationError = ko.computed(() => {
        if (self.forceShowValidationErrors()) {
          return !this.value.isFullyValid();
        } else {
          return !this.value.isPotentiallyValid();
        }
      });
    }
  }

  // Всегда показывать ошибки заполнения формы
  self.forceShowValidationErrors = ko.observable(false);

  // Поля формы
  self.fields = {
    pan: new FormField({
      maskOptions: { mask: '0000 0000 0000 0000 000' },
      validation: val => {
        return cardValidator.number(val);
      },
    }),
    expiry: new FormField({
      maskOptions: { mask: '00{ / }00' },
      validation: val => {
        return cardValidator.expirationDate(val);
      },
    }),
    cvc: new FormField({
      maskOptions: { mask: '000' },
      validation: val => {
        return cardValidator.cvv(val);
      },
    }),
    holder: new FormField({
      maskOptions: {
        mask: /^[A-Z\s]+$/,
        prepare: function(str) {
          return str.toUpperCase();
        },
      },
    }),
  };

  // Тип карты
  self.cardType = ko.computed(function() {
    const cardNumber = self.fields.pan.value();
    const cardTypes = creditCardType(cardNumber);
    if (cardTypes.length === 1) {
      // Выводим только если результат только в одном варианте
      return cardTypes[0];
    }
  });

  // Иконка типа карты
  self.cardTypeIcon = ko.computed(function() {
    const cardType = self.cardType();
    if (cardType) {
      return icons[cardType.type];
    }
  });

  // Имя поля CVV/CVC
  self.cardTypeCvcName = ko.computed(function() {
    const cardType = self.cardType();
    if (cardType) {
      return cardType.code.name;
    }
    return 'CVC/CVV';
  });

  // Можно отправить форму
  self.canSubmit = ko.computed(function() {
    let result = true;
    for (const fieldName of Object.keys(self.fields)) {
      const field = self.fields[fieldName];

      if (field.value.isFullyValid) {
        result = result && field.value.isFullyValid();
      }
    }

    return result;
  });

  self.showCheckFormWarning = ko.computed(function() {
    return !self.canSubmit() && self.forceShowValidationErrors();
  });

  // Форма в режиме выполнения сабмита
  self.isSubmitInProgress = ko.observable(false);

  // Форма выполнена успешно
  self.isFinished = ko.observable(false);

  // Хендлер сабмита формы оплаты
  self.submitForm = async () => {
    // Если форма уже в процессе сабмита - ничего не делаем
    if (self.isSubmitInProgress()) {
      return;
    }

    // Если есть ошибка в форме
    if (!self.canSubmit()) {
      // Будем показывать все ошибки
      self.forceShowValidationErrors(true);

      // Переводим фокус на невалидный элемент
      document.querySelector('.is-invalid').focus();

      return;
    }

    self.isSubmitInProgress(true);

    await wait(2000);

    self.isFinished(true);
  };

  // Определяем лучший вариант типа ввода для текущего браузера
  self.cvcInputType = (() => {
    const style = window.getComputedStyle(document.createElement('input'));
    if (style.webkitTextSecurity === undefined) {
      return 'password';
    }
    return 'tel';
  })();
}

// Применяем биндинги к платежной форме
ko.applyBindings(new PaymentFormModel());

// Выставляем фокус на ввод карты
document.querySelector('#cc-number').focus();
