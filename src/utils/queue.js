// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export default function Queue(asStack){
    let queue=[];
    let running=false;
    Object.defineProperties(
        this,
        {
            add:{
                enumerable:true,
                writable:false,
                value:addToQueue
            },
            queue : {
                enumerable:true,
                writable:false,
                value : queue,
            },
            run:{
                enumerable:true,
                writable:false,
                value:run
            },
            next:{
                enumerable:true,
                writable:false,
                value:run
            },
            clear:{
                enumerable:true,
                writable:false,
                value:clearQueue
            },
            contents:{
                enumerable:false,
                get:getQueue,
                set:setQueue
            },
            autoRun:{
                enumerable:true,
                writable:true,
                value:true
            },
            isRunning:{
                enumerable:true,
                writable:true,
                value: x=> running,
            },
            stop:{
                enumerable:true,
                writable:true,
                value:false
            }
        }
    );


    function clearQueue(){
        for(let i in queue){
            delete queue[i];
        }
        return queue;
    }

    function getQueue(){
        return queue;
    }

    function setQueue(val){
        queue=val;
        return queue;
    }

    function addToQueue(){
        Array.prototype.slice.call(arguments,0).map((cb)=>{
            if(typeof cb =='function'){
                queue.push(cb);
            }
        });
        if(!running && !this.stop && this.autoRun){
            this.next();
        }
    }

    function run(){
        running=true;
        if(queue.length<1 || false && this.stop){
            running=false;
            return;
        }
        queue.shift()();
        running = false;
    }
}