// Регистрируем экстендер для валидации
import ko from "knockout";

ko.extenders.validation = function(target, validationFunc) {
  // Добавляем суб-обсёрваблы
  target.isPotentiallyValid = ko.observable();
  target.isFullyValid = ko.observable();

  function validate(newValue) {
    const result = validationFunc(newValue);

    target.isPotentiallyValid(newValue === '' || result.isValid);
    target.isFullyValid(result.isValid);
  }

  // Валдиация init значение
  validate(target());

  // Валидация когда значение поменяется
  target.subscribe(validate);

  return target;
};