<script setup>
  import {ref, watch} from "vue"
  import BIcon from './components/b-icon.vue'
  import XNav from './components/nav.vue'
  import XConnect from './components/connect.vue'
  import BlogPost from './components/button.vue'


  const posts = ref([
    { id: 1, title: 'My journey with Vue' },
    { id: 2, title: 'Blogging with Vue' },
    { id: 3, title: 'Why Vue is so fun' }
  ])
  const postFontSize = ref(1)
  function knusperFx(params) {
    console.log("knusperFX", params.value)
  }


  const connected = ref(false)
  const presets = ref([])
  const sliderValue = ref(0);

  var device = false
  var gatt = false
  var service = false
  var getPresetListCharacteristic = false
  var setPresetCharacteristic = false
  var brightnessCharacteristic = false
  var powerCharacteristic = false

  var powerState = ref(false)
  var brightness = ref(0)

  const PRIMARY_SERVICE_UUID           = "b2bbc642-46da-11ed-b878-0242ac120002"
  const PRESETLIST_CHARACTERISTIC_UUID = "c9af9c76-46de-11ed-b878-0242ac120002"
  const PRESET_CHARACTERISTIC_UUID     = "c9af9c76-56de-11ed-b878-0242ac120002"
  const BRIGHTNESS_CHARACTERISTIC_UUID = "c9af9c76-76de-11ed-b878-0242ac120002"
  const POWER_CHARACTERISTIC_UUID      = "c9af9c76-66de-11ed-b878-0242ac120002"


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

  function handleNotifications(event) {
    const value = event.target.value
    const uuid = event.target.uuid
    switch (uuid) {
      case POWER_CHARACTERISTIC_UUID:
        powerState.value = !!value.getUint8(0)
        console.log("Changed Power Remotely", powerState.value)
        break;
      case BRIGHTNESS_CHARACTERISTIC_UUID:
        brightness.value = value.getUint8(0)
        console.log("Changed Brightness Remotely", brightness.value)
        break;
    
      default:
        break;
    }
    let a = [];
    // Convert raw data bytes to hex values just for the sake of showing something.
    // In the "real" world, you'd use data.getUint8, data.getUint16 or even
    // TextDecoder to process raw data bytes.
    for (let i = 0; i < value.byteLength; i++) {
      a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
    }
    console.log('> ' + a.join(' '));
  }

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
        filters: [{ services: [PRIMARY_SERVICE_UUID] }],
      })
      device.addEventListener('gattserverdisconnected', onDisconnected)
      gatt = await device.gatt.connect()
      service = await gatt.getPrimaryService(PRIMARY_SERVICE_UUID)

      const characteristics = await service.getCharacteristics()

      // for await (const characteristic of characteristics) {
      //   console.log("xxx", characteristic)
      // }

      getPresetListCharacteristic = await service.getCharacteristic(PRESETLIST_CHARACTERISTIC_UUID)    
      setPresetCharacteristic     = await service.getCharacteristic(PRESET_CHARACTERISTIC_UUID)
      brightnessCharacteristic    = await service.getCharacteristic(BRIGHTNESS_CHARACTERISTIC_UUID)
      powerCharacteristic         = await service.getCharacteristic(POWER_CHARACTERISTIC_UUID)


      //subscribe powerState
      powerCharacteristic.startNotifications().then(()=>{
        console.log('subscribed')
        powerCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications)
      })
      brightnessCharacteristic.startNotifications().then(()=>{
        console.log('subscribed')
        brightnessCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications)
      })

      //read current powerState
      powerState.value = !!(await powerCharacteristic.readValue()).getUint8(0)

      //read bri
      brightness.value = (await brightnessCharacteristic.readValue()).getUint8(0)

      console.log(brightness)
      
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
    console.log("toggle", powerState.value = !powerState.value)
    //await setPresetCharacteristic.writeValue( Uint8Array.of([100]) )
    await powerCharacteristic.writeValue(  Uint8Array.of([ powerState.value ? 1 : 0 ]) )
  }
  async function setBrightness(bri){
    console.log("bri", bri)
    await brightnessCharacteristic.writeValue( Uint8Array.of([bri]) )
  }




  watch(brightness, (newX) => {
    //const b2 = throttle(setBrightness, 500)
    //console.log(`x is ${newX}`)
    throttle(setBrightness, 500)(newX)
  })

</script>

<template>
  <!-- <x-nav title="xxx"></x-nav> -->
  <div :style="{ fontSize: postFontSize + 'em' }">
  <BlogPost
    v-for="post in posts"
    :key="post.id"
    :title="post.title"
    @enlarge-text="postFontSize += 0.1"
    @knusper="knusperFx"
   />
</div>

  <div class="left"></div>
  <div class="container remote-container">

    <!-- <b-icon name="lock-fill" /> -->

    <div class="text-center mb-4">
      <x-connect title="xxx"></x-connect>

      <button id="connectButton"
              class="btn btn-primary btn-lg w-100"
              @click="connect"
              >
        <i id="connectIcon" class="bi bi-lightning-fill"></i>
        {{ !connected?"CONNECT":"DISCONNECT" }}
      </button>

    </div>

    <div class="button-container">
      <button id="powerButton"
              @click="toogleWled"
              :disabled="!connected"
              :class="{ active: powerState }"
              class="btn btn-danger control-button">
          <i class="bi bi-power"></i> Power
      </button>
    </div>

    <div class="slider-container">
      <label for="brightness" class="form-label">Brightness</label>
      <input type="range"
            id="brightness"
            :disabled="!connected"
            :value="brightness"
            @input="({ target }) => (brightness = parseFloat(target.value))"
            class="form-range"
            min="5" max="255" step="1">
    </div>

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


