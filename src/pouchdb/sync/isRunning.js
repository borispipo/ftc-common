import BG_TASK_MANAGER from "./bakgroundTaskManager";

export default function isRunning(){
    return BG_TASK_MANAGER.running ? true : false;
} 