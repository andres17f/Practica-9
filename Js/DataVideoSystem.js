//Funcion para crear la base de datos
//Creamos dos arrays con recursos y temporadas del sistema
var arrayResources = new Array();
var arraySeasons = new Array();

var version = 1;
nameDB = "VideoSystemDB";
//Funcion que crea la base de datos y las tablas que necesitamos
function createTables(){

	if(!window.indexedDB){
		window.alert("El navegador no implementa IndexedDB.");
	}

	var db = indexedDB.open(nameDB, version);

	//El onupgradneed se ejecutara la primera vez y nos establecera la estructura del IndexDB
	db.onupgradeneeded = function (e) {  
		
		var active = db.result;

		active.createObjectStore("categorias", { keyPath: 'name' });	
		active.createObjectStore("producciones", { keyPath: 'title'	});
		active.createObjectStore("actores", { keyPath: 'name' });
		active.createObjectStore("directores", { keyPath: 'name' });
		active.createObjectStore("usuarios", { keyPath: 'user' });

		active.createObjectStore("categoriaProduccion", { keyPath: 'category' });
		active.createObjectStore("directorProduccion", { keyPath: 'name' });
		active.createObjectStore("actorProduccion", { keyPath: 'name' });
	};
}

//Funcion que nos carga los valores iniciales desde el init en un tabla con los objets en un array
function loadDates(table,array) {
	
	var request = indexedDB.open(nameDB);
	
	request.onsuccess = function(event) {

		//La variable db es la base de datos, y abre la tabla con el nombre pasado en lectura/escritura
		var db = event.target.result;         
		
		var addObject = db.transaction([table],"readwrite").objectStore(table);
		
		for (var i in array) {
			
			var addObjectStore = addObject.add(array[i].getObject());
		
		}
		
	};
};

//Funcion que nos carga las relaciones iniciales entre objetos desde el init en una tabla
function loadRelations(table,objets) {

	var request = indexedDB.open(nameDB);

	request.onsuccess = function(event) {
		
		var db = event.target.result;         
		
		var addObject = db.transaction([table],"readwrite").objectStore(table);

		var addObjectStore = addObject.add(objets);

	};
}

//Funcion que no creas un archivo JSON
function createJSON(){
	
	var arrayCategories = new Array();
	var arrayActors = new Array();
	var arrayDirectors = new Array();
	var arrayProductions = new Array();
	var arrayCatPro = new Array();
	var arrayActPro = new Array();
	var arrayDirPro = new Array();
	
	var request = indexedDB.open(nameDB);

	request.onsuccess = function(event) {
		//Asigna el resultado a la variable db, que tiene la base de datos 
		var db = event.target.result;         
		var tables = db.transaction(["categorias","producciones","actores","directores","categoriaProduccion","actorProduccion","directorProduccion"],"readonly");
		
		//Se añaden a los correspondientes array los datos de indexedDB
		var dataCategory = tables.objectStore("categorias");
		dataCategory.openCursor().onsuccess = function(event){
			var category = event.target.result;
			if(category){
				arrayCategories.push(category.value);
				category.continue();
			}
		};

		var dataProductions = tables.objectStore("producciones");
		dataProductions.openCursor().onsuccess = function(event){
			var production = event.target.result;
			if(production){
				arrayProductions.push(production.value);
				production.continue();
			}
		};

		var dataActors = tables.objectStore("actores");
		dataActors.openCursor().onsuccess = function(event){
			var actor = event.target.result;
			if(actor){
				arrayActors.push(actor.value);
				actor.continue();
			}
		};

		var dataDirectors = tables.objectStore("directores");
		dataDirectors.openCursor().onsuccess = function(event){
			var director = event.target.result;
			if(director){
				arrayDirectors.push(director.value);
				director.continue();
			}
		};
		
		var datacatPro = tables.objectStore("categoriaProduccion");
		datacatPro.openCursor().onsuccess = function(event){
			var catPro = event.target.result;
			if(catPro){
				arrayCatPro.push(catPro.value);
				catPro.continue();
			}
		};

		var dataactPro = tables.objectStore("actorProduccion");
		dataactPro.openCursor().onsuccess = function(event){
			var actPro = event.target.result;
			if(actPro){
				arrayActPro.push(actPro.value);
				actPro.continue();
			}
		};

		var datadirPro = tables.objectStore("directorProduccion");
		datadirPro.openCursor().onsuccess = function(event){
			var dirPro = event.target.result;
			if(dirPro){
				arrayDirPro.push(dirPro.value);
				dirPro.continue();
			}
		};

		//Crea un objeto con los datos para insertar
		tables.oncomplete = function(event){
			var dataUp = {
				user: getCookie("userName"),
				categorias: arrayCategories,
				producciones: arrayProductions,
				actores: arrayActors,
				directores: arrayDirectors,
				categoriaProduccion: arrayCatPro,
				directorProduccion: arrayDirPro,
				actorProduccion: arrayActPro
			}

			var xmlhttp = new XMLHttpRequest();
			data = JSON.stringify(dataUp);
			
			xmlhttp.onreadystatechange = function(){
				//Si esta correcto
				if ((this.readyState == 4) && (this.status == 200)){
					exito();
				}
			};
			xmlhttp.open('POST', "php/file.php", true);
			xmlhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
			xmlhttp.send('data=' + data);
		};
	};
	
}

//Funcion init que no proporcionara los datos iniciales que carga el videoSystem en la base
function initPopulate(){
	
	var arrayCategories = new Array();
	var arrayProductions = new Array();
	var arrayDirectors = new Array();
	var arrayActors = new Array();
	var arrayCatProduction = new Array();
	var arrayActProduction = new Array();
	var arrayDirProduction = new Array();
	
	//Se leen los datos del JSON y se introducen en indexedDB
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		
		if (this.readyState == 4 && this.status == 200) {
			
			var myObj = JSON.parse(this.responseText);
			
			//Para cada array del videosystem
			for(i in myObj.categorias){
				arrayCategories.push(myObj.categorias[i]);
			}

			for(i in myObj.producciones){
				arrayProductions.push(myObj.producciones[i]);
			}

			for(i in myObj.directores){
				arrayDirectors.push(myObj.directores[i]);
			}

			for(i in myObj.actores){
				arrayActors.push(myObj.actores[i]);
			}

			for(i in myObj.categoriaProduccion){
				arrayCatProduction.push(myObj.categoriaProduccion[i]);
			}

			for(i in myObj.actorProduccion){
				arrayActProduction.push(myObj.actorProduccion[i]);
			}

			for(i in myObj.directorProduccion){
				arrayDirProduction.push(myObj.directorProduccion[i]);
			}

			//Se añaden los valores a la base de datos con los metodos previos
			loadDates("categorias",arrayCategories);
			loadDates("producciones",arrayProductions);
			loadDates("actores",arrayActors);
			loadDates("directores",arrayDirectors);

			//Relaciones
			loadRelations("categoriaProduccion",arrayCatProduction);
			loadRelations("actorProduccion",arrayActProduction);
			loadRelations("directorProduccion",arrayDirProduction);

		}
	};
	xmlhttp.open("GET", "js/Data.json", true);
	xmlhttp.send();
	
	//Se crea el VideoSystem
	try {
		video = VideoSystem.getInstance();
	} catch (error) {
		console.log("" + error);
	}
	
}

//Funcion que mostrara el menu navegable
function menuPopulate(){

	var menu = document.getElementById("menu");

	while (menu.firstChild) {
		menu.removeChild(menu.firstChild);
		}

	var array = ["Inicio","Categorias","Producciones","Actores","Directores"];
	var arrayHref = [showHomePage,showCategories,showProductions,showActors,ShowDirectors];

	var ul = document.createElement("ul");
	ul.setAttribute("class","nav nav-tabs");

	for (var cont=0 ; cont< 5; cont++) {
		
		var li = document.createElement("li");
		li.setAttribute("class","nav-item btn");
		var a = document.createElement("a");
		a.setAttribute("class","nav-link font-weight-bold text-white");
		li.addEventListener("click",arrayHref[cont]);
		var text = document.createTextNode(array[cont]);
		a.appendChild(text);

		menu.appendChild(ul);
		ul.appendChild(li);
		li.appendChild(a);
	}

}

//funcion que nos mostrara la pagina de incio 
function showHomePage() {
	
	var show = document.getElementById("Nombre");
	show.innerHTML = "Ustream Tv";

	var contentP = document.getElementById("principal");
	contentP.setAttribute("class","d-flex");

	while (contentP.firstChild) {
		contentP.removeChild(contentP.firstChild);
		}

	var divList = document.createElement("ul");
	divList.setAttribute("class","list-group mt-5 mr-5");
	divList.setAttribute("style","width:20%");

	contentP.appendChild(divList);

	//Aqui estableceremos como se han de recorrer los datos, ahora se hara desde indexDb de la siguiente manera
	var request = indexedDB.open(nameDB);

	request.onsuccess = function(event) {

		var db = event.target.result;         
		var objectStore = db.transaction(["categorias"],"readonly").objectStore("categorias");
		//Abre un cursor y reccorre los datos devueltos 
		objectStore.openCursor().onsuccess = function(event) {
			
			var category = event.target.result;

			if (category) {

				var butEle = document.createElement("button");
				butEle.setAttribute("class","list-group-item list-group-item-action text-center btn");
				butEle.setAttribute("value",category.value.name);
				var textB = document.createTextNode(category.value.name);
				butEle.appendChild(textB);
		
				divList.appendChild(butEle);
		
				butEle.addEventListener("click",showProductionsC);

			category.continue();
			}
		}
	}

	var divCatd = document.createElement("div");
	divCatd.setAttribute("style","width:80%;");
	divCatd.setAttribute("class","d-flex flex-column align-items-center border boder-secondary");

	var prodDes = document.createElement("h5");
	prodDes.setAttribute("class","text-center mb-3");
	var textP = document.createTextNode("Producciones destacadas");
	prodDes.appendChild(textP);

	var div1 = document.createElement("div");
	div1.setAttribute("class","carousel slide mb-5");
	div1.setAttribute("data-ride","carousel");
	div1.setAttribute("style","width:50%")

	var div2 = document.createElement("div");
	div2.setAttribute("class","carousel-inner");

	divCatd.appendChild(prodDes);
	divCatd.appendChild(div1);
	div1.appendChild(div2);

	var count = 0;

	var request2 = indexedDB.open(nameDB);

	request2.onsuccess = function(event) {

		var db = event.target.result;         
		var objectStore = db.transaction(["producciones"],"readonly").objectStore("producciones");
		//Abre un cursor y reccorre los datos devueltos 
		objectStore.openCursor().onsuccess = function(event) {
			
			var production = event.target.result;

			if (production) {

				if ( count <= 0 ) {

					var div3 = document.createElement("div");
					div3.setAttribute("class","carousel-item active");

					var imgC = document.createElement("img");
					imgC.setAttribute("class","d-block w-100");
					imgC.setAttribute("src",production.value.image);
					imgC.setAttribute("alt",production.value.title);

					
					div2.appendChild(div3);
					div3.appendChild(imgC);

					count = count+1;

				} else {

					var div3 = document.createElement("div");
					div3.setAttribute("class","carousel-item");

					var imgC = document.createElement("img");
					imgC.setAttribute("class","d-block w-100");
					imgC.setAttribute("src","img/"+production.value.title+".jpg");
					imgC.setAttribute("alt",production.value.title);

					div2.appendChild(div3);
					div3.appendChild(imgC);
				}
				production.continue();
			}
		}
	}			

	var titleF = document.createElement("h5");
	titleF.setAttribute("class","text-center mb-1");
	var textF = document.createTextNode("Iniciar Sesion.");
	titleF.appendChild(textF);

	var formS = document.createElement("form");
	formS.setAttribute("class","mb-1 mt-2");
	formS.setAttribute("style","width:80%");
	formS.setAttribute("name","iniSesion");
	formS.setAttribute("id","formSesion");
	
	var divF1 = document.createElement("div");
	divF1.setAttribute("class","form-group");
	var labF1 = document.createElement("label");
	labF1.setAttribute("for","inputUser");
	var inpF1 = document.createElement("input");
	inpF1.setAttribute("type","text");
	inpF1.setAttribute("id","inputUser");
	inpF1.setAttribute("name","inputUser");
	inpF1.setAttribute("class","form-control");
	inpF1.setAttribute("placeholder","Usuario");
	
	var divF2 = document.createElement("div");
	divF2.setAttribute("class","form-group");
	var labF2 = document.createElement("label");
	labF2.setAttribute("for","inputPasswd");
	var inpF2 = document.createElement("input");
	inpF2.setAttribute("type","password");
	inpF2.setAttribute("id","inputPasswd");
	inpF2.setAttribute("name","inputPasswd");
	inpF2.setAttribute("class","form-control");
	inpF2.setAttribute("placeholder","Contraseña");

	var brIse = document.createElement ("button");
	brIse.setAttribute("class","btn btn-secondary btn-lg mb-3");
	brIse.setAttribute("id","buttonIse");
	brIse.setAttribute("type","button");
	brIse.setAttribute("value","");
	var textBIse = document.createTextNode("Iniciar Sesion");
	brIse.appendChild(textBIse);

	divCatd.appendChild(titleF);
	divCatd.appendChild(formS);
	formS.appendChild(divF1);
	divF1.appendChild(labF1);
	divF1.appendChild(inpF1);
	formS.appendChild(divF2);
	divF2.appendChild(labF2);
	divF2.appendChild(inpF2);
	formS.appendChild(brIse);

	brIse.addEventListener("click", initSession);

	var divInS = document.createElement("div");
	divInS.setAttribute("id","divinfose");
	divInS.setAttribute("class","mb-3 text-primary text-center");

	divCatd.appendChild(divInS);

	var closeT = document.createElement("h5");
	closeT.setAttribute("class","text-center mb-3");
	var textC = document.createTextNode("Cerrar todas las ventanas abiertas.");
	closeT.appendChild(textC);

	var brCs = document.createElement ("button");
	brCs.setAttribute("class","btn btn-secondary btn-lg mb-3");
	brCs.setAttribute("id","buttonP");
	brCs.setAttribute("type","button");
	brCs.setAttribute("value","");
	var textBCs = document.createTextNode("Cerrar");
	brCs.appendChild(textBCs);

	brCs.addEventListener("click", closeWindows);

	divCatd.appendChild(closeT);
	divCatd.appendChild(brCs);

	contentP.appendChild(divCatd);

	window.onload = checkCookie();
}

//Ahora Crearemos una funcion que nos mostrara las categorias
function showCategories(){

	var cookieExist = getCookie("userName");

	var show = document.getElementById("Nombre");
	show.innerHTML = "Categorias";

	var contentP = document.getElementById("principal");
	contentP.setAttribute("class","row");

	while (contentP.firstChild) {
	contentP.removeChild(contentP.firstChild);
	}

	if (cookieExist !== "") {
		
		var columN = document.createElement("div");
		columN.setAttribute("class","col-6 col-md-4 mb-4");
		var contentN = document.createElement("div");
		contentN.setAttribute("class","card");
		var image = document.createElement("img");
		image.setAttribute("class","card-img-top");

		image.setAttribute("src","img/categorias.jpg");
		image.setAttribute("alt","Gestionar categoria");

		var body = document.createElement("div");
		body.setAttribute("class","card-body");
		var paragraph = document.createElement("h5");
		paragraph.setAttribute("class","card-text font-weight-bold");
		paragraph.setAttribute("style","max-height:45px; overflow:hidden; min-height:45px");
		var text = document.createTextNode("Gestionar categorias");
		paragraph.appendChild(text);

		var divbuttons = document.createElement("div");
		divbuttons.setAttribute = ("class","d-flex justify-content-between");

		var button1 = document.createElement("button");
		button1.setAttribute("class","btn btn-primary");
		button1.setAttribute("id","buttonC");
		button1.setAttribute("type","button");
		button1.setAttribute("value","");
		var textB = document.createTextNode("Gestionar");
		button1.appendChild(textB);
		
		contentP.appendChild(columN);
		columN.appendChild(contentN);
		contentN.appendChild(body);
		body.appendChild(image);
		body.appendChild(paragraph);
		body.appendChild(divbuttons);
		divbuttons.appendChild(button1);

		button1.addEventListener("click",formCategory);

	}

	var request = indexedDB.open(nameDB);

	request.onsuccess = function(event) {

		var db = event.target.result;         
		var objectStore = db.transaction(["categorias"],"readonly").objectStore("categorias");
		//Abre un cursor y reccorre los datos devueltos 
		objectStore.openCursor().onsuccess = function(event) {
			
			var category = event.target.result;

			if (category) {

				var colum = document.createElement("div");
				colum.setAttribute("class","col-6 col-md-4 mb-4");
				var content = document.createElement("div");
				content.setAttribute("class","card");
				var image = document.createElement("img");
				image.setAttribute("class","card-img-top");

				image.setAttribute("src","img/"+category.value.name+".jpg");
				image.setAttribute("alt",category.value.name);

				var body = document.createElement("div");
				body.setAttribute("class","card-body");
				var paragraph = document.createElement("h5");
				paragraph.setAttribute("class","card-text font-weight-bold");
				paragraph.setAttribute("style","max-height:45px; overflow:hidden; min-height:45px");
				var text = document.createTextNode(category.value.name);
				paragraph.appendChild(text);

				var divbuttons = document.createElement("div");
				divbuttons.setAttribute("class","d-flex justify-content-between");

				var button = document.createElement("button");
				button.setAttribute("class","btn btn-primary");
				button.setAttribute("id","buttonC");
				button.setAttribute("type","button");
				button.setAttribute("value",category.value.name);
				var textB = document.createTextNode("Ver Producciones");
				button.appendChild(textB);

				contentP.appendChild(colum);
				colum.appendChild(content);
				content.appendChild(body);
				body.appendChild(image);
				body.appendChild(paragraph);
				body.appendChild(divbuttons);
				divbuttons.appendChild(button);
				
				button.addEventListener("click",showProductionsC);
				category.continue();
			}
		}
	}
	
}

//Funcion que mostrara las producciones a partir de una categoria. FALTA MODIFICAR POR NO RELACIONES
function showProductionsC(){
	
	var cat = this.value;
	var show = document.getElementById("Nombre");
	show.innerHTML = "Producciones de "+cat;

	var contentP = document.getElementById("principal");
	contentP.setAttribute("class","row");

	while (contentP.firstChild) {
	contentP.removeChild(contentP.firstChild);
	}

	//Se tienen que poner las producciones de una categoria en concreto.
	var search = false;
	video = VideoSystem.getInstance();
	var categories = video.categories;
	var category = categories.next();
	while ((category.done !== true) && (!search)){

		if (category.value.name == this.value) {
			
			//comienza el iterador de las categorias del boton seleccionado
			var productions = video.getProductionsCategory(category.value);
			var production = productions.next();
			while (production.done !== true){

				var colum = document.createElement("div");
				colum.setAttribute("class","col-6 col-md-4 mb-4");
				var content = document.createElement("div");
				content.setAttribute("class","card");
				var image = document.createElement("img");
				image.setAttribute("class","card-img-top");

				image.setAttribute("src",production.value.image);
				image.setAttribute("alt",production.value.title);

				var body = document.createElement("div");
				body.setAttribute("class","card-body");
				var paragraph = document.createElement("p");
				paragraph.setAttribute("class","card-text font-weight-bold");
				paragraph.setAttribute("style","min-height:45px ; max-height:45px ; overflow:hidden");
				var text = document.createTextNode(production.value.title);
				paragraph.appendChild(text);

				var button = document.createElement("button");
				button.setAttribute("class","btn btn-primary");
				button.setAttribute("id","buttonC");
				button.setAttribute("type","button");
				button.setAttribute("value",production.value.title);
				var textB = document.createTextNode("Ver Produccion");
				button.appendChild(textB);
				
				contentP.appendChild(colum);
				colum.appendChild(content);
				content.appendChild(body);
				body.appendChild(image);
				body.appendChild(paragraph);
				body.appendChild(button);

				button.addEventListener("click",showProductionAlone);
				
				production = productions.next();
			}

			search = true;
		}
		
		category = categories.next();
	}
}

//Funcion que mostrara las producciones desde el menu
function showProductions(){

	var cookieExist = getCookie("userName");

	var show = document.getElementById("Nombre");
	show.innerHTML = "Producciones";

	var contentP = document.getElementById("principal");
	contentP.setAttribute("class","row");

	while (contentP.firstChild) {
	contentP.removeChild(contentP.firstChild);
	}

	if (cookieExist !== "") {
		
		var columN = document.createElement("div");
		columN.setAttribute("class","col-6 col-md-4 mb-4");
		var contentN = document.createElement("div");
		contentN.setAttribute("class","card");
		var image = document.createElement("img");
		image.setAttribute("class","card-img-top");

		image.setAttribute("src","img/producciones.jpg");
		image.setAttribute("alt","Gestionar Producciones");

		var body = document.createElement("div");
		body.setAttribute("class","card-body");
		var paragraph = document.createElement("h5");
		paragraph.setAttribute("class","card-text font-weight-bold");
		paragraph.setAttribute("style","max-height:45px; overflow:hidden; min-height:45px");
		var text = document.createTextNode("Gestionar producciones");
		paragraph.appendChild(text);

		var divbuttons = document.createElement("div");
		divbuttons.setAttribute = ("class","d-flex justify-content-between");

		var button1 = document.createElement("button");
		button1.setAttribute("class","btn btn-primary");
		button1.setAttribute("id","buttonC");
		button1.setAttribute("type","button");
		button1.setAttribute("value","");
		var textB = document.createTextNode("Gestionar");
		button1.appendChild(textB);
		
		contentP.appendChild(columN);
		columN.appendChild(contentN);
		contentN.appendChild(body);
		body.appendChild(image);
		body.appendChild(paragraph);
		body.appendChild(divbuttons);
		divbuttons.appendChild(button1);

		button1.addEventListener("click",formProduction);

	}

	var request = indexedDB.open(nameDB);

    request.onsuccess = function(event) {

        var db = event.target.result;         
        var objectStore = db.transaction(["producciones"],"readonly").objectStore("producciones");
        //Abre un cursor y reccorre los datos devueltos 
        objectStore.openCursor().onsuccess = function(event) {
            
            var production = event.target.result;

            if (production) {

				var colum = document.createElement("div");
				colum.setAttribute("class","col-6 col-md-4 mb-4");
				var content = document.createElement("div");
				content.setAttribute("class","card");
				var image = document.createElement("img");
				image.setAttribute("class","card-img-top");

				image.setAttribute("src",production.value.image);
				image.setAttribute("alt",production.value.title);

				var body = document.createElement("div");
				body.setAttribute("class","card-body");
				var paragraph = document.createElement("p");
				paragraph.setAttribute("class","card-text font-weight-bold");
				paragraph.setAttribute("style","min-height:45px ; max-height:45px ; overflow:hidden");
				var text = document.createTextNode(production.value.title);
				paragraph.appendChild(text);

				var button = document.createElement("button");
				button.setAttribute("class","btn btn-primary");
				button.setAttribute("id","buttonC");
				button.setAttribute("type","button");
				button.setAttribute("value",production.value.title);
				var textB = document.createTextNode("Ver Produccion");
				button.appendChild(textB);
						
				contentP.appendChild(colum);
				colum.appendChild(content);
				content.appendChild(body);
				body.appendChild(image);
				body.appendChild(paragraph);
				body.appendChild(button);

				button.addEventListener("click",showProductionAlone);
				production.continue();
            }
        }
    }
	
}

//Funcion que mostrara los actores desde el menu
function showActors(){

	var cookieExist = getCookie("userName");
	
	var show = document.getElementById("Nombre");
	show.innerHTML = "Actores";

	var contentP = document.getElementById("principal");
	contentP.setAttribute("class","row");

	while (contentP.firstChild) {
	contentP.removeChild(contentP.firstChild);
	}

	if (cookieExist !== "") {
		
		var columN = document.createElement("div");
		columN.setAttribute("class","col-6 col-md-4 mb-4");
		var contentN = document.createElement("div");
		contentN.setAttribute("class","card");
		var image = document.createElement("img");
		image.setAttribute("class","card-img-top");

		image.setAttribute("src","img/persona.png");
		image.setAttribute("alt","Gestionar Actores");

		var body = document.createElement("div");
		body.setAttribute("class","card-body");
		var paragraph = document.createElement("h5");
		paragraph.setAttribute("class","card-text font-weight-bold");
		paragraph.setAttribute("style","max-height:45px; overflow:hidden; min-height:45px");
		var text = document.createTextNode("Gestionar actores");
		paragraph.appendChild(text);

		var divbuttons = document.createElement("div");
		divbuttons.setAttribute = ("class","d-flex justify-content-between");

		var button1 = document.createElement("button");
		button1.setAttribute("class","btn btn-primary");
		button1.setAttribute("id","buttonC");
		button1.setAttribute("type","button");
		button1.setAttribute("value","");
		var textB = document.createTextNode("Gestionar");
		button1.appendChild(textB);
		
		contentP.appendChild(columN);
		columN.appendChild(contentN);
		contentN.appendChild(body);
		body.appendChild(image);
		body.appendChild(paragraph);
		body.appendChild(divbuttons);
		divbuttons.appendChild(button1);

		button1.addEventListener("click",formPerson);

	}

	var request = indexedDB.open(nameDB);

    request.onsuccess = function(event) {

        var db = event.target.result;         
        var objectStore = db.transaction(["actores"],"readonly").objectStore("actores");
        //Abre un cursor y reccorre los datos devueltos 
        objectStore.openCursor().onsuccess = function(event) {
            
            var actor = event.target.result;

            if (actor) {

				var colum = document.createElement("div");
				colum.setAttribute("class","col-6 col-md-4 mb-4");
				var content = document.createElement("div");
				content.setAttribute("class","card");
				var image = document.createElement("img");
				image.setAttribute("class","card-img-top");
				image.setAttribute("src",actor.value.picture);
				image.setAttribute("alt",actor.value.name);

				var body = document.createElement("div");
				body.setAttribute("class","card-body");
				var paragraph = document.createElement("p");
				paragraph.setAttribute("class","card-text font-weight-bold");
				paragraph.setAttribute("style","max-height:45px; overflow:hidden; min-height:45px");
				var text = document.createTextNode(actor.value.name+" "+actor.value.lastName1);
				paragraph.appendChild(text);

				var button = document.createElement("button");
				button.setAttribute("class","btn btn-primary");
				button.setAttribute("id","buttonC");
				button.setAttribute("type","button");
				button.setAttribute("value",actor.value.name);
				var textB = document.createTextNode("Biografia");
				button.appendChild(textB);
				
				contentP.appendChild(colum);
				colum.appendChild(content);
				content.appendChild(body);
				body.appendChild(image);
				body.appendChild(paragraph);
				body.appendChild(button);

				button.addEventListener("click",showActorAlone);
				actor.continue();
            }
        }
    }

	
}

//Funcion que mostrara los directores
function ShowDirectors() {

	var cookieExist = getCookie("userName");
	
	var show = document.getElementById("Nombre");
	show.innerHTML = "Directores";

	var contentP = document.getElementById("principal");
	contentP.setAttribute("class","row");

	while (contentP.firstChild) {
	contentP.removeChild(contentP.firstChild);
	}

	if (cookieExist !== "") {
		
		var columN = document.createElement("div");
		columN.setAttribute("class","col-6 col-md-4 mb-4");
		var contentN = document.createElement("div");
		contentN.setAttribute("class","card");
		var image = document.createElement("img");
		image.setAttribute("class","card-img-top");

		image.setAttribute("src","img/persona.png");
		image.setAttribute("alt","Gestionar Directores");

		var body = document.createElement("div");
		body.setAttribute("class","card-body");
		var paragraph = document.createElement("h5");
		paragraph.setAttribute("class","card-text font-weight-bold");
		paragraph.setAttribute("style","max-height:45px; overflow:hidden; min-height:45px");
		var text = document.createTextNode("Gestionar Directores");
		paragraph.appendChild(text);

		var divbuttons = document.createElement("div");
		divbuttons.setAttribute = ("class","d-flex justify-content-between");

		var button1 = document.createElement("button");
		button1.setAttribute("class","btn btn-primary");
		button1.setAttribute("id","buttonC");
		button1.setAttribute("type","button");
		button1.setAttribute("value","");
		var textB = document.createTextNode("Gestionar");
		button1.appendChild(textB);
		
		contentP.appendChild(columN);
		columN.appendChild(contentN);
		contentN.appendChild(body);
		body.appendChild(image);
		body.appendChild(paragraph);
		body.appendChild(divbuttons);
		divbuttons.appendChild(button1);

		button1.addEventListener("click",formPerson);

	}

	var request = indexedDB.open(nameDB);

    request.onsuccess = function(event) {

        var db = event.target.result;         
        var objectStore = db.transaction(["directores"],"readonly").objectStore("directores");
        //Abre un cursor y reccorre los datos devueltos 
        objectStore.openCursor().onsuccess = function(event) {
            
            var director = event.target.result;

            if (director) {

				var colum = document.createElement("div");
				colum.setAttribute("class","col-6 col-md-4 mb-4");
				var content = document.createElement("div");
				content.setAttribute("class","card");
				var image = document.createElement("img");
				image.setAttribute("class","card-img-top");

				image.setAttribute("src",director.value.picture);
				image.setAttribute("alt",director.value.name);

				var body = document.createElement("div");
				body.setAttribute("class","card-body");
				var paragraph = document.createElement("p");
				paragraph.setAttribute("class","card-text font-weight-bold");
				var text = document.createTextNode(director.value.name+" "+director.value.lastName1);
				paragraph.appendChild(text);

				var button = document.createElement("button");
				button.setAttribute("class","btn btn-primary");
				button.setAttribute("id","buttonC");
				button.setAttribute("type","button");
				button.setAttribute("value",director.value.name);
				var textB = document.createTextNode("Biografia");
				button.appendChild(textB);
				
				contentP.appendChild(colum);
				colum.appendChild(content);
				content.appendChild(body);
				body.appendChild(image);
				body.appendChild(paragraph);
				body.appendChild(button);

				button.addEventListener("click",showDirectorAlone);
                director.continue();
            }
        }
    }


}

//Funcion que muestra a un solo actor con su informacion.
function showActorAlone(){

	var nameActor = this.value;
	
	var show = document.getElementById("Nombre");
	show.innerHTML = "Actores";

	var contentP = document.getElementById("principal");

	while (contentP.firstChild) {
	contentP.removeChild(contentP.firstChild);
	}

	var request1 = indexedDB.open(nameDB);

	request1.onsuccess = function(event) {
	
		var db = event.target.result;         
		var objectStore = db.transaction(["actores"],"readonly").objectStore("actores");
		
		var object = objectStore.get(nameActor);
	
		object.onsuccess = function(event) {
			var actor = object.result;
			
			var content = document.createElement("div");
			content.setAttribute("class", "d-flex")
			content.setAttribute("class","col-3");
			var image = document.createElement("img");

			image.setAttribute("src",actor.picture);
			image.setAttribute("alt",actor.name);
			image.setAttribute("style","max-heigth:150px;");
			image.setAttribute("class", "border border-info");

			var info = document.createElement("div");
			info.setAttribute("class", "ml-3");
			info.setAttribute("class","col-9");

			var title1 = document.createElement("h6");
			var text1 = document.createTextNode("Nombre:");
			title1.appendChild(text1);
			var name = document.createElement("p");
			var textN = document.createTextNode(actor.name);
			name.appendChild(textN);

			var title2 = document.createElement("h6");
			var text2 = document.createTextNode("Apellido:");
			title2.appendChild(text2);
			var surname = document.createElement("p");
			var textS = document.createTextNode(actor.lastName1);
			surname.appendChild(textS);

			var title3 = document.createElement("h6");
			var text3 = document.createTextNode("Fecha de nacimiento:");
			title3.appendChild(text3);
			var date = document.createElement("p");
			var textD = document.createTextNode(actor.born.toLocaleDateString());
			date.appendChild(textD);

			var title4 = document.createElement("h6");
			var text4 = document.createTextNode("Filmografia:");
			title4.appendChild(text4);
				
			contentP.appendChild(content);
			contentP.appendChild(info);
			content.appendChild(image);
			info.appendChild(title1);
			info.appendChild(name);
			info.appendChild(title2);
			info.appendChild(surname);
			info.appendChild(title3);
			info.appendChild(date);
			info.appendChild(title4);

			var prod =document.createElement("div");
			prod.setAttribute("class","d-flex");
			info.appendChild(prod);

			var request2 = indexedDB.open(nameDB);

			request2.onsuccess = function(event) {

				var db = event.target.result;         
				var objectStore = db.transaction(["actorProduccion"],"readonly").objectStore("actorProduccion");

				var object = objectStore.get(nameActor);
				object.onsuccess = function(event) {
					
					//Crea un array con las producciones de ese director
					var prodA = event.target.result.productions;
					for (var i = 0; i < prodA.length; i++) {

						var divI = document.createElement("div");
						divI.setAttribute("class", "mr-2 text-center");

						var image2 = document.createElement("img");
						image2.setAttribute("src",prodA[i].image);
						image2.setAttribute("alt",prodA[i].image);
						image2.setAttribute("style", "height: 80px");
						image2.setAttribute("class","d-block mb-1");

						var b1 = document.createElement ("button");
						b1.setAttribute("class","btn btn-default btn-sm mb-1");
						b1.setAttribute("id","buttonP");
						b1.setAttribute("type","button");
						b1.setAttribute("value",prodA[i].title);
						var textBt = document.createTextNode(prodA[i].title);
						b1.appendChild(textBt);

						b1.addEventListener("click",showProductionAlone);

						prod.appendChild(divI);
						divI.appendChild(image2);
						divI.appendChild(b1);
					}
				};
			};
		};
	};
	
}

//funcion que muestra a un solo director con su informacion
function showDirectorAlone(){

	var nameDirector = this.value;

	var show = document.getElementById("Nombre");
	show.innerHTML = "Actores";

	var contentP = document.getElementById("principal");

	while (contentP.firstChild) {
	contentP.removeChild(contentP.firstChild);
	}

	var request1 = indexedDB.open(nameDB);

	request1.onsuccess = function(event) {
	
		var db = event.target.result;         
		var objectStore = db.transaction(["directores"],"readonly").objectStore("directores");
		
		var object = objectStore.get(nameDirector);
	
		object.onsuccess = function(event) {
			var director = object.result;

			var content = document.createElement("div");
			content.setAttribute("class", "d-flex")
			content.setAttribute("class","col-3");
			var image = document.createElement("img");

			image.setAttribute("src",director.picture);
			image.setAttribute("alt",director.name);
			image.setAttribute("style","max-heigth:300px;");
			image.setAttribute("class", "border border-info");

			var info = document.createElement("div");
			info.setAttribute("class", "ml-3");
			info.setAttribute("class","col-9");

			var title1 = document.createElement("h6");
			var text1 = document.createTextNode("Nombre:");
			title1.appendChild(text1);
			var name = document.createElement("p");
			var textN = document.createTextNode(director.name);
			name.appendChild(textN);

			var title2 = document.createElement("h6");
			var text2 = document.createTextNode("Apellido:");
			title2.appendChild(text2);
			var surname = document.createElement("p");
			var textS = document.createTextNode(director.lastName1);
			surname.appendChild(textS);

			var title3 = document.createElement("h6");
			var text3 = document.createTextNode("Fecha de nacimiento:");
			title3.appendChild(text3);
			var date = document.createElement("p");
			var textD = document.createTextNode(director.born.toLocaleDateString());
			date.appendChild(textD);

			var title4 = document.createElement("h6");
			var text4 = document.createTextNode("Filmografia:");
			title4.appendChild(text4);
				
			contentP.appendChild(content);
			contentP.appendChild(info);
			content.appendChild(image);
			info.appendChild(title1);
			info.appendChild(name);
			info.appendChild(title2);
			info.appendChild(surname);
			info.appendChild(title3);
			info.appendChild(date);
			info.appendChild(title4);

			var prod =document.createElement("div");
			prod.setAttribute("class","d-flex");
			info.appendChild(prod);

			//Abre la conexion con la base de datos
			var request2 = indexedDB.open(nameDB);

			request2.onsuccess = function(event) {

				var db = event.target.result;         
				var objectStore = db.transaction(["directorProduccion"],"readonly").objectStore("directorProduccion");

				var object = objectStore.get(nameDirector);
				object.onsuccess = function(event) {
					
					//Crea un array con las producciones de ese director
					var prodD = event.target.result.productions;
					for (var i = 0; i < prodD.length; i++) {
				
						var divI = document.createElement("div");
						divI.setAttribute("class", "mr-2 text-center");

						var image2 = document.createElement("img");
						image2.setAttribute("src",prodD[i].image);
						image2.setAttribute("alt",prodD[i].image);
						image2.setAttribute("style", "height: 80px");
						image2.setAttribute("class","d-block mb-1");

						var b1 = document.createElement ("button");
						b1.setAttribute("class","btn btn-default btn-sm mb-1");
						b1.setAttribute("id","buttonP");
						b1.setAttribute("type","button");
						b1.setAttribute("value",prodD[i].tile);
						var textBt = document.createTextNode(prodD[i].title);
						b1.appendChild(textBt);

						b1.addEventListener("click",showProductionAlone);

						prod.appendChild(divI);
						divI.appendChild(image2);
						divI.appendChild(b1);
					}
				};
			};
		};
	};			
	
}

//funcion que muestra los datos de una produccion.
function showProductionAlone(){

	var titleProduction = this.value;
	
	var show = document.getElementById("Nombre");
	show.innerHTML = "Produccion";

	var contentP = document.getElementById("principal");

	while (contentP.firstChild) {
	contentP.removeChild(contentP.firstChild);
	}

	var request1 = indexedDB.open(nameDB);

	request1.onsuccess = function(event) {
	
		var db = event.target.result;         
		var objectStore = db.transaction(["producciones"],"readonly").objectStore("producciones");
		
		var object = objectStore.get(titleProduction);
	
		object.onsuccess = function(event) {
			var production = object.result;
			
			var content = document.createElement("div");
			content.setAttribute("class", "d-flex");
			content.setAttribute("class","col-3");
			var image = document.createElement("img");

			image.setAttribute("src",production.image);
			image.setAttribute("alt",production.title);
			image.setAttribute("style","max-heigth:300px;");
			image.setAttribute("class", "border border-info");

			var info = document.createElement("div");
			info.setAttribute("class", "ml-3");
			info.setAttribute("class","col-9");

			var title1 = document.createElement("h6");
			var text1 = document.createTextNode("Titulo:");
			title1.appendChild(text1);
			var name = document.createElement("p");
			name.setAttribute("id","prodN");
			var textN = document.createTextNode(production.title);
			name.appendChild(textN);

			var title2 = document.createElement("h6");
			var text2 = document.createTextNode("Nacionalidad:");
			title2.appendChild(text2);
			var nationality = document.createElement("p");
			var textNa = document.createTextNode(production.nationality);
			nationality.appendChild(textNa);

			
			var title3 = document.createElement("h6");
			title3.setAttribute("class", "mt-2")
			var text3 = document.createTextNode("Publicacion:");
			title3.appendChild(text3);
			var publication = document.createElement("p");
			var textP = document.createTextNode(production.publication.toLocaleDateString());
			publication.appendChild(textP);

			var title4 = document.createElement("h6");
			title4.setAttribute("class", "mt-2")
			var text4 = document.createTextNode("Sinopsis:");
			title4.appendChild(text4);
			var synopsis = document.createElement("p");
			var textS = document.createTextNode(production.synopsis);
			synopsis.appendChild(textS);

			contentP.appendChild(content);
			contentP.appendChild(info);
			content.appendChild(image);
			info.appendChild(title1);
			info.appendChild(name);
			info.appendChild(title2);
			info.appendChild(textNa);
			info.appendChild(title3);
			info.appendChild(publication);
			info.appendChild(title4);
			info.appendChild(synopsis);

			if(production.value instanceof Movie){

				var titleR = document.createElement("h6");
				titleR.setAttribute("class", "mt-2")
				var textR = document.createTextNode("Recurso:");
				titleR.appendChild(textR);

				var br = document.createElement ("button");
				br.setAttribute("class","btn btn-default btn-sm mb-1");
				br.setAttribute("id","buttonP");
				br.setAttribute("type","button");
				br.setAttribute("value",production.title);
				var textBr = document.createTextNode("Ver");
				br.appendChild(textBr);

				info.appendChild(titleR);
				info.appendChild(br);

				br.addEventListener("click", openWindows);

			}else{

				var titleR = document.createElement("h6");
				titleR.setAttribute("class", "mt-2")
				var textR = document.createTextNode("Temporadas:");
				titleR.appendChild(textR);

				var br = document.createElement ("button");
				br.setAttribute("class","btn btn-default btn-sm mb-1");
				br.setAttribute("id","buttonP");
				br.setAttribute("type","button");
				br.setAttribute("value",production.title);
				var textBr = document.createTextNode("Ver");
				br.appendChild(textBr);

				info.appendChild(titleR);
				info.appendChild(br);

				br.addEventListener("click", openWindows);

			}

			var title5 = document.createElement("h6");
			title5.setAttribute("class", "mt-2")
			var text5 = document.createTextNode("Director:");
			title5.appendChild(text5);

			info.appendChild(title5);

			var prod =document.createElement("div");
			prod.setAttribute("class","d-flex");
			info.appendChild(prod);

			//Para mostrar los directores
			var request2 = indexedDB.open(nameDB);

			request2.onsuccess = function(event) {
		
			var db = event.target.result;         
			var objectStore = db.transaction(["directores"],"readonly").objectStore("directores");
				//Abre un cursor y reccorre los datos devueltos 
				objectStore.openCursor().onsuccess = function(event) {
					
					var director = event.target.result;
		
					if (director) {
				
						var Dn = (director.value.name);
						var Di = (director.value.picture);
						var Dn = (director.value.name);
						var Dnl = (director.value.name+" "+director.value.lastName1);
						//Abre la conexion con la base de datos
						var request2 = indexedDB.open(nameDB);

						request2.onsuccess = function(event) {

							var db = event.target.result;         
							var objectStore = db.transaction(["directorProduccion"],"readonly").objectStore("directorProduccion");

							var object = objectStore.get(Dn);

							object.onsuccess = function(event) {
								
								var prodD = event.target.result;
								
								for (var i = 0; i < prodD.productions.length; i++) {
								
									if (prodD.productions[i].title == titleProduction) {
									
									var divI = document.createElement("div");
									divI.setAttribute("class", "mr-2 text-center");

									var image2 = document.createElement("img");
									image2.setAttribute("src",Di);
									image2.setAttribute("alt",Dnl);
									image2.setAttribute("style", "height: 80px");
									image2.setAttribute("class","d-block mb-1");

									var b1 = document.createElement ("button");
									b1.setAttribute("class","btn btn-default btn-sm mb-1");
									b1.setAttribute("id","buttonP");
									b1.setAttribute("type","button");
									b1.setAttribute("value",Dn);
									var textBt = document.createTextNode(Dnl);
									b1.appendChild(textBt);

									b1.addEventListener("click",showDirectorAlone);

									prod.appendChild(divI);
									divI.appendChild(image2);
									divI.appendChild(b1);

									}
								}
							}
								
						}
						director.continue();
					}
				}
			}

			var title6 = document.createElement("h6");
			title6.setAttribute("class", "mt-2")
			var text6 = document.createTextNode("Reparto:");
			title6.appendChild(text6);

			info.appendChild(title6);

			var prod2 =document.createElement("div");
			prod2.setAttribute("class","d-flex");
			info.appendChild(prod2);

			//Para mostrar los actores
			
			var request3 = indexedDB.open(nameDB);

			request3.onsuccess = function(event) {
		
			var db = event.target.result;         
			var objectStore = db.transaction(["actores"],"readonly").objectStore("actores");
				//Abre un cursor y reccorre los datos devueltos 
				objectStore.openCursor().onsuccess = function(event) {
					
					var actor = event.target.result;
		
					if (actor) {
				
						var An = (actor.value.name);
						var Ai = (actor.value.picture);
						var An = (actor.value.name);
						var Anl = (actor.value.name+" "+actor.value.lastName1);
						//Abre la conexion con la base de datos
						var request2 = indexedDB.open(nameDB);

						request2.onsuccess = function(event) {

							var db = event.target.result;         
							var objectStore = db.transaction(["actorProduccion"],"readonly").objectStore("actorProduccion");

							var object = objectStore.get(An);

							object.onsuccess = function(event) {
								
								var prodA = event.target.result;
								
								for (var i = 0; i < prodA.productions.length; i++) {
									
									if (prodA.productions[i].title == titleProduction) {

									var divI = document.createElement("div");
									divI.setAttribute("class", "mr-2 text-center");

									var image2 = document.createElement("img");
									image2.setAttribute("src",Ai);
									image2.setAttribute("alt",An);
									image2.setAttribute("style", "height: 80px");
									image2.setAttribute("class","d-block mb-1");

									var b1 = document.createElement ("button");
									b1.setAttribute("class","btn btn-default btn-sm mb-1");
									b1.setAttribute("id","buttonP");
									b1.setAttribute("type","button");
									b1.setAttribute("value",An);
									var textBt = document.createTextNode(Anl);
									b1.appendChild(textBt);

									b1.addEventListener("click",showActorAlone);

									prod2.appendChild(divI);
									divI.appendChild(image2);
									divI.appendChild(b1);

									}
								}
							}
								
						}
						actor.continue();
					}
				}
			}				
		}
	}
}

var arrayWindows = new Array();

function openWindows() {
	if (window.name.open){

		window.name.focus();

	} else {

	var newWindow = window.open("Window.html",this.value,"toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=250,width=500,height=500");
	arrayWindows.push(newWindow);

	}
}

function closeWindows() {
	
	var index = 0;

	if (!arrayWindows.length !== 0) {
		
		while ( index < arrayWindows.length) {
			console.log("entra al while");
			arrayWindows[index].close();
			arrayWindows.splice(index, 1);
		}
	}
}

function showResource() {

	var prod = document.getElementById("prodN").innerHTML;

	for ( let index = 0 ; index < arrayWindows.length ; index++){
		if (arrayWindows[index].name === prod) {
			var windowS = arrayWindows[index];
		}
	}

	var contentP = windowS.document.getElementById("data");

	var search = false;
	var video = VideoSystem.getInstance();
	var productions = video.productions;
	var production = productions.next();
	while ((production.done !== true) && (!search)){

		if (production.value.title == prod) {

			var content = document.createElement("div");
			content.setAttribute("class", "d-flex");
			content.setAttribute("class","col-3");
			var image = document.createElement("img");

			image.setAttribute("src",production.value.image);
			image.setAttribute("alt",production.value.title);
			image.setAttribute("style","max-heigth:300px;");
			image.setAttribute("class", "border border-info");

			var info = document.createElement("div");
			info.setAttribute("class", "ml-3");
			info.setAttribute("class","col-9");

			var title1 = document.createElement("h6");
			var text1 = document.createTextNode("Titulo:");
			title1.appendChild(text1);
			var name = document.createElement("p");
			var textN = document.createTextNode(production.value.title);
			name.appendChild(textN);

			var title2 = document.createElement("h6");
			var text2 = document.createTextNode("Nacionalidad:");
			title2.appendChild(text2);
			var nationality = document.createElement("p");
			var textNa = document.createTextNode(production.value.nationality);
			nationality.appendChild(textNa);

			
			var title3 = document.createElement("h6");
			title3.setAttribute("class", "mt-2")
			var text3 = document.createTextNode("Publicacion:");
			title3.appendChild(text3);
			var publication = document.createElement("p");
			var textP = document.createTextNode(production.value.publication.toLocaleDateString());
			publication.appendChild(textP);

			var title4 = document.createElement("h6");
			title4.setAttribute("class", "mt-2")
			var text4 = document.createTextNode("Sinopsis:");
			title4.appendChild(text4);
			var synopsis = document.createElement("p");
			var textS = document.createTextNode(production.value.synopsis);
			synopsis.appendChild(textS);

			contentP.appendChild(content);
			contentP.appendChild(info);
			content.appendChild(image);
			info.appendChild(title1);
			info.appendChild(name);
			info.appendChild(title2);
			info.appendChild(textNa);
			info.appendChild(title3);
			info.appendChild(publication);
			info.appendChild(title4);
			info.appendChild(synopsis);

			if(production.value instanceof Movie){

				var titleR = document.createElement("h6");
				titleR.setAttribute("class", "mt-2")
				var textR = document.createTextNode("Recurso:");
				titleR.appendChild(textR);
				var resource = document.createElement("p");
				var textR2 = document.createTextNode(production.value.resource);
				resource.appendChild(textR2);

				var titleL = document.createElement("h6");
				titleL.setAttribute("class", "mt-2")
				var textL = document.createTextNode("Localizaciones:");
				titleL.appendChild(textL);
				var locations = document.createElement("p");
				var textL2 = document.createTextNode(production.value.locations);
				locations.appendChild(textL2);

				info.appendChild(titleR);
				info.appendChild(resource);
				info.appendChild(titleL);
				info.appendChild(locations);

			}

			if(production.value instanceof Serie) {

				var titleS = document.createElement("h6");
				titleS.setAttribute("class", "mt-2")
				var textS = document.createTextNode("Temporadas:");
				titleS.appendChild(textS);
				var seasons = document.createElement("p");
				var textS = document.createTextNode(production.value.seasons);
				seasons.appendChild(textS);

				info.appendChild(titleS);
				info.appendChild(seasons);

			}

			search = true;

		}
		production = productions.next();
	}

}

//Funcion que inicia y carga la base de datos.
function init(){
	createTables();
	initPopulate();
	menuPopulate();
	showHomePage();
	//createJSON();
}

window.onload = init;