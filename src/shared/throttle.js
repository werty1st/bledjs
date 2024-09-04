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


export { throttle }