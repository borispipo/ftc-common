const BG_TASK = {};

if(typeof window !='undefined' && window && !window.BG_TASK_MANAGER){
    Object.defineProperties(window,{
        BG_TASK_MANAGER : {value : BG_TASK}
    })
};

export default BG_TASK;