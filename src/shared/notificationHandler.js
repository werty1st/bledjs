import { PRIMARY_SERVICE_UUID,
    PRESETLIST_CHARACTERISTIC_UUID,
    GET_FX_CHARACTERISTIC_UUID,
    BRIGHTNESS_CHARACTERISTIC_UUID,
    POWER_CHARACTERISTIC_UUID } from '@/shared/bluetoothConstants'

const handleNotifications = function (callback) {
    return (event) => {
        const value = event.target.value
        const uuid = event.target.uuid
        switch (uuid) {
            case POWER_CHARACTERISTIC_UUID:
                callback(value)
                break;
            case BRIGHTNESS_CHARACTERISTIC_UUID:
                callback(value)
                break;
            case GET_FX_CHARACTERISTIC_UUID:
                callback(value)
                break;
            
            default:
                break;
        }
    }
}


export { handleNotifications }