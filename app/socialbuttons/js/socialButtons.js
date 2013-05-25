// работаем в замыкании нечего засорять глобальную область видимости
(function(){
    // это наш объект модуля (иньектор по ангуляровски
    var socialButtons = angular.module('dea', []);

    // это справочник в котором хранится самый сок социальных кнопок, это шаблоны кнопок и некоторые методы
    var socialDictionary = {
        vk:{
            template:'<a href="http://vk.com/share.php?url={{url}}&title={{title}}">vk</a>'
        },
        fb:{
            template:'<a href="http://www.facebook.com/sharer.php?u={{url}}&t={{title}}">fb</a>'
        },
        gp:{ //google+
            template:'<a href="https://plus.google.com/share?hl={{language}}&url={{url}}">g+</a>'
        },
        // верхним трем ( vk, fb, gp ) дескрипшон особо то и не нужон они сами его с сайта заберут из метатегов
        tb:{//тумблер
            template:'<a href="http://www.tumblr.com/share/link?url={{url}}&name={{title}}&description={{description}}">tb</a>',
            genDescription:function(descr,img){
                var text = '<img src="' + img + '"><br>' + descr;
                return encodeURIComponent(text); // так надо
            }
        },
        lj:{
            template:'<a href="http://www.livejournal.com/update.bml?event={{description}}&subject={{title}}">lj</a>',
            genDescription:function(descr,img,url){
                var text = '<img src="' + img + '"><br>' + descr + ' <a href="' + url + '">'+ url +'</a>';
                return encodeURIComponent(text); // так надо
            }
        },
        bg:{//blogger
            template:'<a href="http://www.blogger.com/blog-this.g?t={{description}}&u={{url}}&n={{title}}">bg</a>',
            genDescription:function(descr,img){
                var text = '<img src="' + img + '"><br>' + descr;
                return encodeURIComponent(text); // так надо
            }
        },
        tw:{//twitter
            template:'<a href="http://twitter.com/share?url={{url}}&text={{title}}&via=coolWidget:p">tw</a>'
        }
    };

    // директива контейнера
    socialButtons.directive('socialButtons', function() {
        return {
            // тип преобразования element ( фигачим прямо теги )
            restrict: 'E',
            // все что было внутри нашего элемента надо перенести в место помеченное ng-transclude (будет чуть дальше в шаблоне)
            transclude: true,
            // создавать ли свой скоп для элемента, думаю что лишним не будет хотя в нашем случае это не важно
            scope: {},
            // собственно конструктор контроллера
            // первый элемент массива это название зависимости которая нам нужна для конструктора
            controller: ['$element',function($element) {

                // все атрибуты достаем руками, можно и через scope
                // но они поступят после вызова конструктора а нам так не надо
                var url = $element.attr('url'),
                    img = $element.attr('img'),
                    title = $element.attr('sb-title'),
                    description = $element.attr('description');

                // этот метод проставляет подчиненной кнопке соотвествующие свойства
                this.setButton = function(button,nm) {

                    // если у нас есть генератор дескрипшонов то воспользуемся им
                    var descriptionGenerator = socialDictionary[nm].genDescription;
                    if ( descriptionGenerator  ){
                        button.description  = descriptionGenerator( description, img, url, title );
                    } else {
                        button.description = encodeURIComponent(description);
                    }
                    button.url          = encodeURIComponent(url);
                    button.img          = encodeURIComponent(img);
                    button.title        = encodeURIComponent(title);
                }
            }],
            template:
            // ng-transclude отвечает за то,
            // чтобы при первом преобразовании тега social-buttons
            // его дочерние элементы не потерялись, а были вставленны внутрь
                '<div class="social-buttons-set" ng-transclude></div>',
            replace: true
        };
    });
// функа генерить функу которая делает кнопку O_o
    var makeSocialButton = function(nm){
        // тут у нас все в общем виде
        return function(){
            return {
                // родительский элемент должен быть <social-buttons>
                require: '^socialButtons',
                restrict: 'E',
                scope: {},
                // этот метод будет вызываться автоматически для связывания дочернего и родительского элемента
                link: function(scope, e, a, socialButtonsCtrl) {
                    // у нас есть кнопка но она понятия не имеет какие данные нам шарить
                    // зато этими данными владеет родительский элемент (social-buttons)
                    // попросим его поделится ими
                    // scope - это наш контроллер он же является наблюдаемым объектом
                    // при назначении ему свойств будет оказано влияние на отображение
                    socialButtonsCtrl.setButton(scope,nm);
                },
                template: socialDictionary[nm].template,
                replace: true
            };
        };
    };

    //
    for (var nm in socialDictionary){
        if (socialDictionary.hasOwnProperty(nm)){
            socialButtons.directive(nm, makeSocialButton(nm));
        }
    }
})()

