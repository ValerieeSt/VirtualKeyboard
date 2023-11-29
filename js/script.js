const Keyboard = {
    elements: {
      main: null,
      keysContainer: null,
      keys: [],
      current: null,
    },
  
    eventHandlers: {
      oninput: null,
      onclose: null,
    },
  
    properties: {
      value: '',
      capsLock: false,
      lang: 'en',
      shift: false,
      position: 0,
      voice: false,
    
    },
  
    keyLayout: {
      en: [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'backspace',
        'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
        'caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'enter',
        'shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/',
        'done', 'voice',  'lang', 'space', 'left', 'right'
      ],
      ru: [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'backspace',
        'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ',
        'caps', 'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', 'enter',
        'shift', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', ',', '.', '?',
        'done', 'voice',  'lang', 'space', 'left', 'right'
      ],
    },
  
   
  
    init() {
        this.elements.main = document.createElement('div');
        this.elements.keysContainer = document.createElement('div');
    
        this.elements.main.classList.add('keyboard', 'keyboard--hidden');
        this.elements.keysContainer.classList.add('keyboard__keys');
        this.elements.keysContainer.appendChild(this._createKeys());
    
        this.elements.keys = this.elements.keysContainer.querySelectorAll(
          '.keyboard__key'
        );
    
        this.elements.main.appendChild(this.elements.keysContainer);
        this.elements.main.addEventListener('mousedown', (e) => {
          e.preventDefault();
        });
        document.body.appendChild(this.elements.main);
    
        document.querySelectorAll('.virtual-keyboard-textarea').forEach((element) => {
          element.addEventListener('focus', (e) => {
            this.elements.current = element;
            this.open(
              element.value,
              (currentValue, args) => {
                element.value = currentValue;
                element.focus();
                if (this.properties.shift) {
                  this._toggleShift();
                }
                if (args !== 'backspace') {
                  this.properties.position++;
                }
                element.selectionStart = element.selectionEnd = this.properties.position;
              },
              () => {
                element.blur();
              }
            );
          });
          element.addEventListener('click', (e) => {
            this.properties.position = e.target.selectionStart;
          });
        });
    
        document.addEventListener('keydown', (e) => {
          this._handlePhysicalKeyboard(e);
        });
    
      
  
      document.addEventListener('keydown', (e) => {
        this._handlePhysicalKeyboard(e);
      });
  
      document.addEventListener('keyup', (e) => {
        this._handlePhysicalKeyboard(e);
        this.properties.value = e.target.value;
        this.properties.position = e.target.selectionStart;
      });
    },
  
    _handlePhysicalKeyboard(e) {
      let symbol;
  
      if (e.key !== undefined) {
        symbol = e.key;
      } else if (e.keyIdentifier !== undefined) {
        symbol = String.fromCharCode(e.keyIdentifier);
      } else if (e.keyCode !== undefined) {
        symbol = String.fromCharCode(e.keyCode);
      }
  
      let key = symbol.toLowerCase();
      key = key === 'capslock' ? 'caps' : key;
      key = key === ' ' ? 'space' : key;
      key = key === 'arrowright' ? 'right' : key;
      key = key === 'arrowleft' ? 'left' : key;
  
      if (this._isEnglishKeyboard(key)) {
        this.properties.lang = 'ru';
        this._toggleLang();
      } else if (this._isRussianKeyboard(key)) {
        this.properties.lang = 'en';
        this._toggleLang();
      }
  
      let keyIndex = this.keyLayout[this.properties.lang].indexOf(key);
      if (keyIndex !== -1) {
        if (e.type === 'keydown') {
          this.elements.keys[keyIndex].classList.add(
            'keyboard__key--active-once'
          );
          if (key === 'caps') {
            this.properties.capsLock = !(
              e.getModifierState && e.getModifierState('CapsLock')
            );
            this._toggleCapsLock();
          }
          if (key === 'shift') {
            const prevShift = this.properties.shift;
            this.properties.shift = !(
              e.getModifierState && e.getModifierState('Shift')
            );
            this._toggleShift(this.properties.shift === prevShift);
          }
        } else if (e.type === 'keyup') {
          this.elements.keys[keyIndex].classList.remove(
            'keyboard__key--active-once'
          );
          if (key === 'shift') {
            this.properties.shift = true;
            this._toggleShift();
          }
        }
      }
    },
  
    _isEnglishKeyboard(key) {
      return key.length === 1 && /[a-zA-Z]/.test(key);
    },
  
    _isRussianKeyboard(key) {
      return key.length === 1 && /[а-яА-ЯЁё]/.test(key);
    },


    _createIconHtml(iconName) {
      return `<i class="material-icons">${iconName}</i>`;
    },
  
    _createKeys() {
      const fragment = document.createDocumentFragment();
      const keyLayout = this.keyLayout;
    
      keyLayout[this.properties.lang].forEach((key) => {
        const keyElement = document.createElement('button');
        const insertLineBreak =
          ['backspace', 'p', 'enter', '/', '?', 'ъ'].indexOf(key) !== -1;
    
        keyElement.setAttribute('type', 'button');
        keyElement.classList.add('keyboard__key');
    
        switch (key) {
          case 'backspace':
            keyElement.classList.add('keyboard__key--wide');
            keyElement.innerHTML = this._createIconHtml('backspace');
            keyElement.addEventListener('click', (e) => {
              let { lang, value, position } = this.properties;
              if (position > 0) {
                this.properties.value = `${value.substring(
                  0,
                  position === 0 ? 0 : position - 1
                )}${value.substring(position, value.length)}`;
                this.properties.position = position <= 0 ? 0 : position - 1;
              }
    
              this._triggerEvent('oninput', 'backspace');
            });
            break;
    
          case 'enter':
            keyElement.classList.add('keyboard__key--wide');
            keyElement.innerHTML = this._createIconHtml('keyboard_return');
            keyElement.addEventListener('click', (e) => {
              this._changeValueByPosition('\n');
              this._triggerEvent('oninput');
              const { lang } = this.properties;
            });
            break;

            case 'caps':
            keyElement.classList.add('keyboard__key--wide', 'keyboard__key--activatable');
            keyElement.innerHTML = this._createIconHtml('keyboard_capslock');
            if (this.properties.capsLock) {
              keyElement.classList.add('keyboard__key--active');
            }
            keyElement.addEventListener('click', (e) => {
              this._toggleCapsLock();
              const lang = this.properties.lang;
        
            });
            break;
    
            case 'shift':
              keyElement.classList.add('keyboard__key--wide');
              keyElement.innerHTML = this._createIconHtml('keyboard_arrow_up');
              if (this.properties.shift) {
                keyElement.classList.add('keyboard__key--active-once');
              }
              keyElement.addEventListener('click', (e) => {
                this._toggleShift();
                const { lang } = this.properties;
              });
    
              break;
    
            case 'done':
              keyElement.classList.add('keyboard__key--dark');
              keyElement.innerHTML = this._createIconHtml('keyboard_hide');
              keyElement.addEventListener('click', (e) => {
                this.close();
                const { lang } = this.properties;
               
                this._triggerEvent('onclose');
              });
              break;

              case 'lang':
                keyElement.classList.add('keyboard__key--dark');
                keyElement.innerHTML = this._toggleCase(this.properties.lang);
                keyElement.addEventListener('click', (e) => {
                  this._toggleLang();
                  keyElement.innerHTML = this.properties.lang;
                  const { lang } = this.properties;
                
                });
                break;
      
              case 'space':
                keyElement.classList.add('keyboard__key--extra-wide');
                keyElement.innerHTML = this._createIconHtml('space_bar');
                keyElement.addEventListener('click', (e) => {
                  this._changeValueByPosition(' ');
                  const { lang } = this.properties;
                 
                  this._triggerEvent('oninput');
                });
                break;
          
        }
    
        fragment.appendChild(keyElement);
    
        if (insertLineBreak) {
          fragment.appendChild(document.createElement('br'));
        }
      });
    
      return fragment;
    },

    
    open(initialValue, oninput, onclose) {
        this.properties.value = initialValue || '';
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.remove('keyboard--hidden');
      },
    
      close() {
        this.properties.value = '';
        this.elements.main.classList.add('keyboard--hidden');
      },
    };
    
    window.addEventListener('DOMContentLoaded', function () {
      Keyboard.init();
    });