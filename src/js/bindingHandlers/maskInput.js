import ko from "knockout";
import IMask from "imask";

// Кастомный биндинг для работы с маской ввода
ko.bindingHandlers.maskInput = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    const options = allBindings.get('maskOptions') ||
      bindingContext.$data.maskOptions || { mask: '' };

    const mask = IMask(element, options);

    mask.typedValue = ko.unwrap(valueAccessor());

    bindingContext.mask = mask;

    element.addEventListener('input', () => {
      valueAccessor()(mask.unmaskedValue);
    });

    ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
      mask.destroy();
    });
  },

  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    ko.utils.unwrapObservable(valueAccessor());
    bindingContext.mask.typedValue = ko.unwrap(valueAccessor());
  },
};