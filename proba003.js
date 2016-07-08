// 1. Конструктор Animal
function Animal(name) {
  this.name = name;
  this.speed = 0;
}

// 1.1. Методы -- в прототип

Animal.prototype.stop = function() {
  this.speed = 0;
  alert( this.name + ' стоит' );
}

Animal.prototype.run = function(speed) {
  this.speed += speed;
  alert( this.name + ' бежит, скорость ' + this.speed );
};

// 2. Конструктор Rabbit
function Rabbit(name) {
  this.name = name;
  this.speed = 0;
}

// 2.1. Наследование
//Rabbit.prototype = Object.create(Animal.prototype);
Rabbit.prototype.__proto__=Animal.prototype;
Rabbit.prototype.constructor = Rabbit;

// 2.2. Методы Rabbit
Rabbit.prototype.jump = function() {
  this.speed++;
  alert( this.name + ' прыгает, скорость ' + this.speed );
}

var r1=new Rabbit("Rabbit_1");
var r2=new Rabbit("Rabbit_2");

r1.run(10);
r2.run(100);
r1.jump();
r2.jump();
r1.run(20);
r2.run(300);
r1.stop();
r2.stop();