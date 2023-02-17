const fs = require('fs');

function leerInventario(){
  let datosBebidas = null;
  let inventario = null;
  let bebidas=[];
  try{
    datosBebidas = fs.readFileSync('./data/inventario.json');
    inventario = JSON.parse(datosBebidas);
    for(let clave in inventario) {//se cargan una lista con el nombre de los usuarios
      if (inventario.hasOwnProperty(clave)) {
      bebidas.push({nombre:inventario[clave].nombre, unidades:inventario[clave].unidades, precio:inventario[clave].precio, descripcion:inventario[clave].descripcion});
      }
    }
  }
  catch(error){
    console.log("ERROR LECTURA inventario.json -> " + error);
  }
  finally{
    return bebidas;
  }
}

function leerPlantilla(){
  let datosUsuarios = null;
  let plantilla = null;
  let usuarios=[];
  try{
    datosUsuarios = fs.readFileSync('./data/usuarios.json');
    plantilla = JSON.parse(datosUsuarios);
    for(let clave in plantilla) {//se cargan una lista con el nombre de los usuarios
      if (plantilla.hasOwnProperty(clave)) {
      usuarios.push({nombre:plantilla[clave].nombre, cuotas:plantilla[clave].cuotas});
      }
    }
  }
  catch(error){
    console.log("ERROR LECTURA usuarios.json -> " + error);
  }
  finally{
    return usuarios;
  }
}

function leerRegistros(){
  let datosLogs = null;
  let data = null;
  let registros=[];
  try{
    datosLogs = fs.readFileSync('./data/logs.json');
    data = JSON.parse(datosLogs);
    for(let clave in data) {//se cargan una lista con el nombre de los usuarios
      if (data.hasOwnProperty(clave)) {
        registros.push({nombre:data[clave].nombre, user: data[clave].user, hora: data[clave].hora, dia: data[clave].dia, msg: data[clave].msg, cantidad: data[clave].cantidad, preciounidad: data[clave].preciounidad});
      }
    }
  }
  catch(error){
    console.log("ERROR LECTURA logs.json -> " + error);
  }
  finally{
    return registros;
  }

}

//FechaHora actual
function horaDiaLog(){ //imprime por consola el log
  const tiempoTranscurrido = Date.now();
  const hoy = new Date(tiempoTranscurrido);
  const fechaHoy = hoy.toISOString().split("T")[0]; //dia de hoy 
  const horaActual = hoy.toISOString().split("T")[1].split(".")[0]; //horaactual
  return [fechaHoy, horaActual];
}

//se muestran los articulos del inventario en el inicio
const inicio = async (request, response) => {
  let data;
  if(leerInventario().length>0 || leerPlantilla().length>0 || leerRegistros().length>0){
    console.log(leerInventario());
    console.log(leerPlantilla());
    console.log(leerRegistros());
    response.sendStatus(200);
  }
  else{
    console.log("ERROR DE LECTURA INICIAL");
    response.sendStatus(503);
  }
};

//salida de de inventario, entrada de caja
const entradaCaja = async (request, response) => {
  const {nombre, cantidad, usuario} = request.body;
  const inventario = leerInventario();
  const registros = leerRegistros();
  const [fecha, hora] = horaDiaLog();
  let precio=0;
  try{
    for(articulo in inventario){
      if(inventario[articulo].nombre==nombre){
        inventario[articulo].unidades -= cantidad;
        precio = inventario[articulo].precio;
      }
    }
    fs.writeFileSync('./data/inventario.json', JSON.stringify(inventario), 'utf-8');
  }
  catch(error){
    console.log("ERROR: INVENTARIO -> " + error);
    response.sendStatus(503);
  }
  finally{
    let registro = {
      nombre: "Entrada",
      user: usuario,
      hora: hora,
      dia: fecha,
      msg: nombre,
      cantidad: cantidad,
      preciounidad: precio
    }
    registros.push(registro);
    console.log(registros);
    try{
      fs.writeFileSync('./data/logs.json', JSON.stringify(registros), 'utf-8');
      response.sendStatus(200);
    }
    catch(error){
      console.log("ERROR: LOG -> " + error);
      response.sendStatus(503);
    }
  }
};

//entrada de inventario, salida de caja
const salidaCaja = async (request, response) => {
  const {nombre, cantidad, precio} = request.body;
  const registros = leerRegistros();
  const [fecha, hora] = horaDiaLog();
  let registro = {
    nombre: "Salida",
    user: "",
    hora: hora,
    dia: fecha,
    msg: nombre,
    cantidad: cantidad,
    preciounidad: precio
  }
  registros.push(registro);
  console.log(registros);
  try{
    fs.writeFileSync('./data/logs.json', JSON.stringify(registros), 'utf-8');
    response.sendStatus(200);
  }
  catch(error){
    console.log("ERROR: LOG -> " + error);
    response.sendStatus(503);
  }
};

const pagoCuota = async (request, response) => {
  const {nombre, cantidad, usuario} = request.body;
  const plantilla = leerPlantilla();
  const registros = leerRegistros();
  const [fecha, hora] = horaDiaLog();
  try{
    for(persona in plantilla){
      if(plantilla[persona].nombre==nombre){
        plantilla[persona].cuotas += cantidad;
      }
    }
    fs.writeFileSync('./data/usuarios.json', JSON.stringify(plantilla), 'utf-8');
  }
  catch(error){
    console.log("ERROR: USUARIOS -> " + error);
    response.sendStatus(503);
  }
  finally{
    let registro = {
      nombre: "Entrada",
      user: usuario,
      hora: hora,
      dia: fecha,
      msg: nombre,
      cantidad: cantidad,
      preciounidad: 20
    }
    registros.push(registro);
    console.log(registros);
    try{
      fs.writeFileSync('./data/logs.json', JSON.stringify(registros), 'utf-8');
      response.sendStatus(200);
    }
    catch(error){
      console.log("ERROR: LOG -> " + error);
      response.sendStatus(503);
    }
  }
};

module.exports = {
    inicio,
    entradaCaja,
    salidaCaja,
    pagoCuota
  };