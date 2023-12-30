<script setup>
import {ref, watch} from "vue"
</script>


<script>

const connected = ref(false)
const presets = ref([])
const sliderValue = ref(0);

var device = false;
var gatt = false;
var service = false;
var getPresetListCharacteristic = false;
var setPresetCharacteristic = false;
var setBrightnessCharacteristic = false;

async function connect() {

  function onDisconnected(){
    console.log('> Bluetooth Device disconnected')
  }


  if (connected.value == true) {

    if (device.gatt.connected) {
      device.gatt.disconnect();
    } else {
      log('> Bluetooth Device is already disconnected')
    }
    connected.value = false
  } else {

    device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ["b2bbc642-46da-11ed-b878-0242ac120002"] }],
    })
    device.addEventListener('gattserverdisconnected', onDisconnected)
    gatt = await device.gatt.connect()
    service = await gatt.getPrimaryService("b2bbc642-46da-11ed-b878-0242ac120002")

    getPresetListCharacteristic = await service.getCharacteristic("c9af9c76-46de-11ed-b878-0242ac120002")    
    setPresetCharacteristic =     await service.getCharacteristic("c9af9c76-56de-11ed-b878-0242ac120002")
    setBrightnessCharacteristic = await service.getCharacteristic("c9af9c76-76de-11ed-b878-0242ac120002")

    loadPresets()
    connected.value = true
    
  }
}

async function activatePreset( id ){
  console.log("selected preset:", id)
  await setPresetCharacteristic.writeValue( Uint8Array.of([parseInt(id)]) )
}

async function loadPresets(){

  presets.value = []
  
  if (getPresetListCharacteristic.properties.read) {
    const value = await getPresetListCharacteristic.readValue()

    const enc = new TextDecoder("utf-8");
    const text = enc.decode(value)

    const presetsJson = JSON.parse(text)

    for (const [key, value] of Object.entries(presetsJson)) {
      if (value && value.length > 0)
        presets.value.push({ id: key, name: value })
    }
    //console.log("Received presets:", presets)
  }

  // presets.value = [
  //   { id: 1, name: "set1" },
  //   { id: 2, name: "set2" },
  //   { id: 3, name: "set3" },
  //   { id: 4, name: "set4" },
  //   { id: 5, name: "set5" },
  //   { id: 6, name: "set6" },
  // ]

}

async function toogleWled(){
  console.log("toggle")
  await setPresetCharacteristic.writeValue( Uint8Array.of([100]) )
}
async function setBrightness(bri){
  console.log("bri", bri)
  await setBrightnessCharacteristic.writeValue( Uint8Array.of([bri]) )
}

function throttle(fn, wait){
    let throttled = false
    let latest
    return function(...args){
        latest = args
        if(!throttled){
            //fn.apply(this,args);
            throttled = true;
            setTimeout(()=>{
                throttled = false;
                fn.apply(this,latest);
            }, wait);
        }
    }
}


const b2 = throttle(setBrightness, 500)

watch(sliderValue, (newX) => {
  //console.log(`x is ${newX}`)
  b2(newX)
})

</script>

<template>

  <div class="left"></div>
  <div class="center box ">

    <div class="uk-flex uk-flex-center uk-padding-small">
      <button class="uk-button uk-button-danger" @click="connect"><span uk-icon="bolt"></span>{{ !connected?"CONNECT":"DISCONNECT" }}</button>
    </div>
    <button @click="toogleWled" class="uk-button uk-button-primary" :disabled="!connected" >Toggle WLED</button>
    
    <label for="brightness">Brightness</label>
    <input type="range" id="brightness"
      :value="sliderValue"
      @input="({ target }) => (sliderValue = parseFloat(target.value))"
      min="1" :disabled="!connected" max="100" value="50" />


    <PresetList :presets="presets" @selectPreset="activatePreset"/>

  </div>
  <div class="right"></div>

</template>
<style scoped>
  .box {
      box-shadow: inset 7px 0 9px -7px rgba(0,0,0,0.3),
                  inset -7px 0 9px -7px rgba(0,0,0,0.3);
  }
  #app .center {
    padding: 0 1rem 0 1rem;
    background-color: white;
  }
  #app {
    background-color:rgb(235 249 251);
  }
</style>


