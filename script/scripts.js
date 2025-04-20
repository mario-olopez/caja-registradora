document.addEventListener("DOMContentLoaded", () => {
    const beerPhotos = [
        "/media/mahou_reserva_xl.png",
        "/media/guinness-draught.png",
        "/media/LA-CHOUFFE-40Y-33cl-bottle.png",
        "/media/alhambra-1925.webp",
        "/media/alhambra-roja.png",
        "/media/mahou_clasica_xl_2024.png",
        "/media/cruzcampo.png"
    ];

    let productos = [
        { nombre: "Cerveza especial reserva", precio: 250, cambio: false }, //El cambio es falso porque el dinero total en la caja es de 234,27
        { nombre: "Cerveza negra irlandesa", precio: 100, cambio: true },
        { nombre: "Cerveza monjes belgas", precio: 50, cambio: true },
        { nombre: "Cerveza especial Alhambra", precio: 20, cambio: true },
        { nombre: "Cerveza roja Alhambra", precio: 10, cambio: true },
        { nombre: "Mahou Clásica", precio: 1, cambio: true },
        { nombre: "Cruzcampo", precio: 0.50, cambio: true }
    ];

    let cajaRegistradora = [
        { valor: 500, cantidad: 0 },
        { valor: 200, cantidad: 0 },
        { valor: 100, cantidad: 0 },
        { valor: 50, cantidad: 1 },
        { valor: 20, cantidad: 4 },
        { valor: 10, cantidad: 8 },
        { valor: 5, cantidad: 2 },
        { valor: 2, cantidad: 5 },
        { valor: 1, cantidad: 4 },
        { valor: 0.50, cantidad: 0 },
        { valor: 0.20, cantidad: 0 },
        { valor: 0.10, cantidad: 1 },
        { valor: 0.05, cantidad: 2 },
        { valor: 0.02, cantidad: 3 },
        { valor: 0.01, cantidad: 1 },
    ];

    // Funciones para cargar y guardar la caja en Local Storage
    function cargarCaja() {
        const guardado = localStorage.getItem("cajaRegistradora");
        return guardado ? JSON.parse(guardado) : cajaRegistradora;
    }

    function guardarCaja(caja) {
        localStorage.setItem("cajaRegistradora", JSON.stringify(caja));
    }

    // Función para procesar el pago de una cerveza
    function procesarPago(precio, pagoCliente) {
        let caja = cargarCaja();
        let totalPagado = pagoCliente.reduce((acc, num) => acc + num.valor * num.cantidad, 0); //Sumamos las cantidades 
        totalPagado = Math.round(totalPagado * 100) / 100; //Redondeamos a dos decimales

        if (totalPagado < precio) { //Si el pago es menor que el precio imprime que el pago es insuficiente
            mostrarCambio("Pago insuficiente");
            return;
        }

        // Actualizamos la caja con los billetes entregados por el usuario
        //Recorremos el array con un forEach para comprobar si lo que entrega el usuario coincide con alguno de los valores de cajaRegistradora
        pagoCliente.forEach(billeteCliente => { 
            const billeteEncontrado = caja.find(num => num.valor === billeteCliente.valor);  
            if (billeteEncontrado) {  //Si lo encuentra, suma la cantidad entregada por el usuario a la cantidad que había en la caja                                                
                billeteEncontrado.cantidad += billeteCliente.cantidad;                      
            } else { //Si no lo encuentra, lo añadimos a la cajaRegistradora
                caja.push({ valor: billeteCliente.valor, cantidad: billeteCliente.cantidad });
            }
        });

        // Calcular el cambio necesario
        let cambioNecesario = Math.round((totalPagado - precio) * 100) / 100; //Calculamos el cambio que hay quedarle al usuario y lo redondeamos
        if (cambioNecesario === 0) {
            mostrarCambio("Gracias por pagar con el dinero justo. ¡Que tenga un buen día!");
            guardarCaja(caja); //Aunque no devuelva cambio, guardamos el dinero del cliente en la caja
            return;
        }

        //Ordenamos la caja según el valor de los billetes de mayor a menor, para devolver el cambio óptimo (los billetes de más valor)
        let cajaOrdenada = [...caja].sort((a, b) => b.valor - a.valor);
        let cambio = []; //Array vacío donde almacenamos el cambio a devolver
        let cambioRestante = cambioNecesario; 

        //Recorremos el array caja
        for (let billete of cajaOrdenada) {
            let cantidadUsada = 0;
            //Verificamos con un while si quedan billetes de ese valor en la caja (cantidad) y por otro lado si el cambio es mayor o igual que el valor
            while (billete.cantidad > 0 && cambioRestante >= billete.valor) {
                cambioRestante = Math.round((cambioRestante - billete.valor) * 100) / 100; //Restamos el valor del billete al cambio que queda por devolver
                billete.cantidad--; //Quitamos una unidad del billete utilizado para el cambio a la caja
                cantidadUsada++; //Sumamos a la cuenta de cuántos billetes de ese tipo se han usado
            }
            if (cantidadUsada > 0) { //Condicional para verificar si se han usado billetes 
                cambio.push({ valor: billete.valor, cantidad: cantidadUsada }); //Metemos en el array cambio el objeto con el valor y la cantidad usada
                const billeteCaja = caja.find(b => b.valor === billete.valor); //Buscamos el billete en la caja
                billeteCaja.cantidad -= cantidadUsada; //Restamos a la caja la cantidad de billetes que hemos usado
            }
        }

        //Condicional en caso de que no se pueda devolver el cambio exacto
        if (cambioRestante > 0) {
            mostrarCambio("No se puede devolver el cambio exacto. Vuelva mañana");
            return;
        }

        //Mostrar el cambio entregado
        //Transformamos el array cambio en un string con map
        let mensajeCambio = "Aquí tiene su cambio: <br>" + cambio.map(c => `${c.cantidad} x ${c.valor}€`).join("<br>");
        mostrarCambio(mensajeCambio);
        guardarCaja(caja);//Actualizamos la caja de Local Storage
    }

    // Función para mostrar el cambio en el DOM
    function mostrarCambio(mensaje) {
        const sonidoCambio = new Audio("./media/Cash Register Sound FX 4.mp3");
        const divCambio = document.getElementById("container-cambio");
        divCambio.innerHTML = "";
    
        const tarjetaCambio = document.createElement("div");
        tarjetaCambio.classList.add("tarjeta-cambio");
    
        const textoCambio = document.createElement("p");
        textoCambio.innerHTML = mensaje;
    
        tarjetaCambio.appendChild(textoCambio);
        divCambio.appendChild(tarjetaCambio);
    
        sonidoCambio.play();
    }

    // Función para iniciar el pago después de seleccionar una cerveza
    function solicitarPago(producto) {

        let billetes = [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01];
        let pago = []; //Array vacío para introducir el pago del usuario

        //Pedimos al usuario la cantidad de cada billete
        for (let valor of billetes) {
            let cantidad = prompt(`¿Con cuántas monedas o billetes de ${valor}€ va a pagar?`); //Vamos pidiendo los billetes al usuario
            cantidad = parseInt(cantidad); //Transformamos a un int lo que nos pase el usuario
            if (!isNaN(cantidad) && cantidad > 0) { //!isNaN dice si la cantidad es un número válido
                pago.push({ valor, cantidad }); //Metemos en el array de pago el valor y la cantidad
            }
        }

        //Llamamos a la función procesar pago
        procesarPago(producto.precio, pago);
    }

    //Manipulación del DOM para cargar las cervezas en el contenedor
    const containerPhotos = document.getElementById("container-cervezas");

    productos.forEach((producto, index) => {
        const beerCard = document.createElement("div");
        beerCard.classList.add("beer-card");

        const beerPhoto = document.createElement("img");
        beerPhoto.src = beerPhotos[index];
        beerPhoto.classList.add("beer-photo");

        const beerName = document.createElement("p");
        beerName.classList.add("beer-name");
        beerName.textContent = producto.nombre;

        const beerPrice = document.createElement("p");
        beerPrice.classList.add("beer-price");
        beerPrice.textContent = `${producto.precio}€`;

        beerCard.appendChild(beerPhoto);
        beerCard.appendChild(beerName);
        beerCard.appendChild(beerPrice);
        containerPhotos.appendChild(beerCard);

        // Añadir el evento para seleccionar la cerveza
        beerCard.addEventListener("click", () => {
            solicitarPago(producto);
        });
    });

    setTimeout(() => {
        alert("Selecciona un producto");
    }, 3000);
});








