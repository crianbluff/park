document.addEventListener('DOMContentLoaded', () => {
	// Variable para cupturar las placas ingresadas en un array
	let shields = [];

	// Variable para capturar en un array los días de la semana
	let days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

	// Variable para verificar si ya se puede mostrar el modal
	let shieldSuccess = false;

	let inputShield = document.getElementById('shield');

	// Carga el localstorage
	loadStorage();

	function saveStorage() {
		// Si existe el objeto localstorage, que sirve para verificar si el navegador lo soporta
		// Crea un item en el localstorage con el nombre 'shieldsStorage' y el valor que es el array de objetos de las placas
		// Se le colocar JSON.stringfy para que lo pueda leer
		typeof(Storage) !== 'undefined' ? localStorage.setItem('shieldsStorage', JSON.stringify(shields)) : '';
	}

	function loadStorage() {
		// Si existe el item localstorage con el nombre 'shieldsStorage' el array de objetos de las placas lo renombra
		if ( localStorage.getItem('shieldsStorage') ) {
			shields = JSON.parse(localStorage.getItem('shieldsStorage'));
			showList();
		} else {
				shields = [];
			}
	}

	// Función para sacar la diferencia en horas entre 2 fechas
	function diffHours(dt2, dt1) {
		let diff = (dt2.getTime() - dt1.getTime()) / 1000;
		diff /= (60 * 60) / 60;
		return Math.abs(Math.round(diff));
	}

	function captureName() {
		// Variable para guardar el valor que escribe el usuario al ingresar
		let shieldIngStart = inputShield.value;
		return shieldIngStart;
	}

	function captureDateIng() {
		// Variable para guardar la hora de ingreso
		let dateIng = new Date().toLocaleString('en-Us', {
			hour12: false
		});
		return dateIng;
	}

	function captureDateExit() {
		// Variable para guardar la hora de salida
		let dateExit = new Date().toLocaleString('en-Us', {
			hour12: false
		});
		return dateExit;
	}

	function captureDayIng() {
		// Variable para guardar la hora de salida
		let dayIng = days[new Date().getDay()];
		return dayIng;
	}

	function captureHourIng() {
		// Variable para guardar la hora de salida
		let hourIng = new Date().getHours();
		return hourIng;
	}

	function shieldsData(name, dateIng, dateExit, dateDayIng, dateHourIng) {
		this.dateHourIng = dateHourIng;
		this.dateDayIng = dateDayIng;
		this.name = name;
		this.dateIng = dateIng;
		this.dateExit = dateExit;
	}

	function insertDataShieldInModal(obj) {
		let keys = Object.keys(obj);
		// Remueve los elementos que cumplan con el nombre indicado del array keys que se creo arriba
		for ( let i = keys.length -1; i >= 0; i-- ) {
			if ( keys[i] === 'dateDayIng' || keys[i] === 'dateHourIng' ) {
				keys.splice(i, 1);
			}
		}

		// Recorre el array keys que se creo arriba y saca cada uno de los nombre y los inserta en cada uno de los span del modal
		for ( let i = 0; i < keys.length; i++ ) {
			let dataShield = keys[i];
			document.querySelectorAll('.data-shield')[i].textContent = obj[dataShield];
		}
	}

	function filterDataShields(name) {
		shields.filter( obj => {
			// Si el objeto coincide con el nombre que se digito en el input
			if ( obj.name === name ) {

				let priceHour = 0;
				// Remplaza a ese objeto el atributo la fecha salida
				obj.dateExit = captureDateExit();
				obj['timeElapsed'] = `${ diffHours( new Date( obj.dateIng ), new Date( obj.dateExit ) ) } minutos`;
				// Si es un día entre semana el objeto price va a hacer de minuto a 70 pesos
				if ( obj['dateDayIng'] === 'Lunes' || obj['dateDayIng'] === 'Martes' || obj['dateDayIng'] === 'Miercoles' || obj['dateDayIng'] === 'Jueves' || obj['dateDayIng'] === 'Viernes' ) {
					new Date().getHours() >= 19 || new Date().getHours() <= 7 ? priceHour = 40 : priceHour = 70;
					obj['price'] = `$${ diffHours( new Date( obj.dateIng ), new Date( obj.dateExit ) ) * priceHour } pesos`;
					// Si es un fin de semana el objeto price va hacer de 8000 pesos sin importar el tiempo
					insertDataShieldInModal(obj);
				}
				else if ( obj['dateDayIng'] === 'Domingo' || obj['dateDayIng'] === 'Sabado' ) {
					obj['price'] = '$8.000 pesos';
				}
			}
		});
	}

	function createShield(name) {
		let shield = new shieldsData(captureName(), captureDateIng(), 'Estacionado', captureDayIng(), captureHourIng());
		// Devuelve un booleano dependiendo si encuentra en el array shields la propiedad name y concuerda con la que se le envie como parametro
		let foundShiledIng = shields.some( el => el.name === name );

		if ( !foundShiledIng ) {
			shields.push(shield);
			showList();
			saveStorage();
			hideMessageDanger();
			messageSucces('La placa se ha creado de manera correcta');
			console.log(shields);
		} else {
				messageDanger('¡La placa ya ha sido digitado anteriormente!');
			}
	}

	function updateShield(name) {
		// Devuelve un booleano dependiendo si encuentra en el array shields la propiedad name y concuerda con la que se le envie como parametro
		let foundShiledExit = shields.some( el => el.name === name );

		if ( !foundShiledExit ) {
			// En caso de que el valor de la placa se encuentra en el array de shields
			messageDanger('¡La placa no ha sido ingresada anteriormente, primero debe de ingresarla!');
		}
		
		else {
			// En caso de que el valor de la placa no se encuentra en el array de shields
			shieldSuccess = true;
			filterDataShields(name);
			showList();
			saveStorage();
			hideMessageDanger();
			messageSucces('Se ha generado su factura de manera correcta');
		}
		
	}

	function deleteShield(name) {
		// Elimina el objeto que coincida con el nombre
		// shields = shields.filter( obj => obj.name !== name);
		shields = shields.filter( obj => obj.name !== name);
		showList();
		saveStorage();
		messageSucces('Se ha pagado la factura de manera correcta');
	}

	function showList() {
		let list = '';
		for (let i = 0; i < shields.length; i++) {
			// Si existe el atributo price
			if ( shields[i].price ) {
				list +=
					`
					<div class="list-shields">
						<p>
							<span>
								Número De Placa:
							</span>

							<span>
								${ shields[i].name }
							</span>
						</p>

						<p>
							<span>
								Fecha Ingreso:
							</span>

							<span>
								${ shields[i].dateIng }
							</span>
						</p>

						<p>
							<span>
								Fecha Salida:
							</span>

							<span>
								${ shields[i].dateExit }
							</span>
						</p>
						
						<p>
							<span>
								Tiempo Estacionado:
							</span>

							<span>
								${ shields[i].timeElapsed }
							</span>
						</p>

						<p>
							<span>
								Precio:
							</span>

							<span>
								${ shields[i].price }
							</span>
						</p>
					</div>
					`
				;
			}

			// Si no existe el atributo price
			if ( !shields[i].price ) {
				list +=
					`
						<div class="list-shields">
							<p>
								<span>
									Número De Placa:
								</span>

								<span>
									${ shields[i].name }
								</span>
							</p>
			
							<p>
								<span>
									Fecha Ingreso:
								</span>

								<span>
									${ shields[i].dateIng }
								</span>
							</p>
			
							<p>
								<span>
									Fecha Salida:
								</span>

								<span>
									${ shields[i].dateExit }
								</span>
							</p>
						</div>
					`
				;
			}		
		}

		document.getElementById('ctn-list-shields').innerHTML = list;
	}

	function messageSucces(text) {
		document.querySelector('.success').addEventListener('transitionend', () => {
			document.getElementById('success').classList.remove('fadein');
		});
		document.getElementById('success').classList.add('fadein');
		document.getElementById('success').textContent = text;
	}

	function messageDanger(text) {
		document.getElementById('danger').classList.add('fadein');
		document.getElementById('danger').textContent = text;
	}
	
	function hideMessageDanger() {
		// Si existe la clase fadein en message la remueve
		document.getElementById('danger').classList.contains('fadein') ? document.getElementById('danger').classList.remove('fadein') : '';
	}

	function validateEmpty() {
		this.classList.add('validate-input');
		// Si el input tiene por lo menos un carcater
		this.value.length >= 1 ? this.nextSibling.nextSibling.firstElementChild.classList.add('fadein') : this.nextSibling.nextSibling.firstElementChild.classList.remove('fadein');
	}

	function resetFormWithX(el) {
		el.target.classList.remove('fadein');
		el.target.parentElement.previousSibling.previousSibling.value = '';
		el.target.parentElement.parentElement.firstElementChild.classList.remove('active-input');
		el.target.parentElement.classList.remove('active-input');
		el.target.parentElement.parentElement.firstElementChild.classList.remove('active-input');
		el.target.parentElement.previousSibling.previousSibling.classList.remove('validate-input');
	}

	function resetForm() {
		document.querySelector('.clear-input').classList.remove('fadein');
		document.querySelector('.clear-input').parentElement.previousSibling.previousSibling.value = '';
		document.querySelector('.clear-input').parentElement.parentElement.firstElementChild.classList.remove('active-input');
		document.querySelector('.clear-input').parentElement.classList.remove('active-input');
		document.querySelector('.clear-input').parentElement.parentElement.firstElementChild.classList.remove('active-input');
		document.querySelector('.clear-input').parentElement.previousSibling.previousSibling.classList.remove('validate-input');
	}

	function closeModal() {
		document.body.classList.remove('no-scroll-y');
		document.getElementById('modal').classList.remove('show-modal');
	}

	document.addEventListener('submit', e => {
		e.preventDefault();
		if ( e.target.matches('form') ) {

			let shieldIngStart = inputShield.value;

			// Si el valor de la placa esta vacio
			// Y Si el valor de la placa no esta vacio
			if ( shieldIngStart === '' ) {
				messageDanger('¡Debe digitar una placa para poder agregarla!');
			} else {
					createShield(shieldIngStart);
					resetForm();
				}
		}
	});

	document.addEventListener('click', e => {

		if ( e.target.matches('#exit') ) {
			let shieldExitEnd = inputShield.value;
			resetForm();
			// Si el valor de la placa esta vacio
			if ( shieldExitEnd === '' ) {
				// Si el valor de la placa no esta vacio
				messageDanger('¡Debe digitar una placa para poder finalizarla!');
			} else {
					updateShield(shieldExitEnd);
					if ( shieldSuccess ) {
						shieldSuccess = false;
						let temp = e.target.getAttribute('data-modal');
						document.body.classList.add('no-scroll-y');
						document.querySelector(temp).classList.add('show-modal');
						console.log(shields);
					}
				}
		}

		if ( e.target.matches('.clear-input') ) {
			resetFormWithX(e);
		}

		if ( e.target.matches('.btn-close-modal i') || e.target.matches('.btn-close-footer-modal') ) {
			document.body.classList.remove('no-scroll-y');
			let temp = e.target.getAttribute('data-modal');
			document.querySelector(temp).classList.remove('show-modal');
		}

		if ( e.target.matches('#delete-shield') ) {
			let shieldDeleteModal = document.querySelector('.data-shield').textContent;
			deleteShield(shieldDeleteModal);
		}
	});

	inputShield.addEventListener('focus', e => {
		e.target.previousSibling.previousSibling.classList.add('active-input');
		e.target.nextSibling.nextSibling.classList.add('active-input');
	});

	document.querySelector('.form').addEventListener('keydown', e => {
		e.key === 'Enter' ? e.preventDefault() : '';
	});

	// Si el input esta vacio y a la vez presionan la tecla de espacio
	inputShield.addEventListener('keydown', e => e.target.value === '' && e.keyCode === 32 ? e.preventDefault() : '');

	inputShield.addEventListener('keyup', validateEmpty);
	inputShield.addEventListener('keydown', validateEmpty);
	// Si le da la tecla Escape cierra el modal
	document.addEventListener('keydown', e => e.key === 'Escape' ? closeModal() : '');

	inputShield.addEventListener('focusout', e => {
		e.target.classList.add('validate-input');

		// Si el input esta vacio
		if ( e.target.value === '' ) {
			e.target.previousSibling.previousSibling.classList.remove('active-input');
			e.target.nextSibling.nextSibling.classList.remove('active-input');
		}
	});

});