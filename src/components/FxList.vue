<template>
    <div>
        <h3>Effects</h3>
        <div class="">
            <ul id="effect-list">
                <li v-for="(effect, index) in effects">
                    <button class="" @click="applyFx(index)">
                        {{ effect }}
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { GET_FX_CHARACTERISTIC_UUID, SET_FX_CHARACTERISTIC_UUID } from '@/shared/bluetoothConstants'
import { handleNotifications } from '@/shared/notificationHandler'

//receive brightnessCharacteristic and connection State
const props = defineProps({
    getFxCharacteristic: Object,
    setFxCharacteristic: Object,
    disabled: Boolean
})

const effects = ref([])
const fragments = []

//on Change set Listener
watch( [ ()=>props.getFxCharacteristic ], async ([getFxCharacteristic])=>{


    //write chunkIndex
    //read chunk, chunkIndex++ until chunk == "reset"
    //readFx( getFxCharacteristic )
    
    const callback = (value) => {
        const text = new TextDecoder("utf-8").decode(value);

        if (text != "reset") {
            fragments.push(text)
            //request next fragment
            console.log( "requesting next fragmet:", fragments.length )
            setTimeout( async ()=>{
                await getFxCharacteristic.writeValue( Uint8Array.of([ fragments.length ]) )
            }, 100)
        } else {
            let tempstr = fragments.join("")
            console.log(tempstr)
            effects.value = JSON.parse( tempstr ).filter(v=>v!="RSVD")
            fragments.length = 0
        }
        console.log("FxFragmet", text)
    };

    // Install notification handler first
    getFxCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications(callback));

    // Start notifications
    await getFxCharacteristic.startNotifications();
    console.log('subscribed getFxCharacteristic');

    // Perform the first write operation after the event handler and notifications are set up
    await getFxCharacteristic.writeValue(Uint8Array.of([parseInt(0)]));



})



async function applyFx(fxId) {
   //getFxCharacteristic
   console.log("FX id:", fxId)
   await props.setFxCharacteristic.writeValue(Uint8Array.of([parseInt(fxId)]));
}

</script>





<style scoped>
ul {
  list-style: none;
}

li > button {
    min-width: 200px;
}


</style>
