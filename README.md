# 3D-Asteroids

## Integrantes

* Abraham García Del Corral 
	* A01023356
* Gerardo Ángeles
	* A01338190
* Lorenzo Jácome Ceniceros
	* A01026759

## Overview
 3D Asteriods recrea el clásico juego arcade Asteroids, pero esta vez en ua versión en tres dimensiones, a color y con gráficas mejoradas.

 El jugador toma el lugar de un piloto espacial, el cual deberá esquivar y destruir los asteroides que vayan apareciendo en el área.
 La vista del jugador será en tercera persona, para poder tener más campo de visión y estar alerta de los alrededores.
 El objetivo del juego es obtener la puntuación más alta posible, a través de la destrucción de asteroides. Estos aparecen en tres diferentes tamaños, por lo que los puntos que se obtienen por la destrucción de alguno de ellos, varía según este factor.
 * Grande: 50 puntos.
 * Mediano: 75 puntos.
 * Pequeños: 100 puntos.


 El jugador logra destruir los asteroides gracias al sofisticado sistema de defensa que tiene la nave. El cual dispara proyectiles en una sola dirección, la cual es el frente de la nave. Sin embargo, no todos los asteroides podrán ser destruidos por completo de un solo disparo, ya que los asteroides más grandes, al ser impactados por el proyectil, desprenderán asteroides más pequeños.

 La nave solo resiste tres impactos de asteroides, sin importar el tamaño de los mismos. Por lo que si esto sucede, el juego terminará.


## Requerimientos
* Start menu
	* Menú de inicio. Muestra el titulo del juego y al precionar la tecla "espacio" inicia el juego. 
	* Muestra las top puntuaciones con los top jugadores. 
* Pause menu
	* Continuar
	* Salir
* Cámara
	* Perspectiva de tercera persona de la nave
	* Se mueve con el cursor
* Controles
	* Cámara se mueve con el cursor
	* La nave se mueve por el "terreno" de juego con la distribución de flechas WASD
	* Para seleccionar las opciones en el menú, se utiliza tanto el cursor, como el teclado (Flechas y enter)
	* Pause menu se accede con ESC / Space

## Dependencias
* ThreeJs
* Por definir...

