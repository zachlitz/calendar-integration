import * as React from "react";
import * as ReactDOM from "react-dom";
import './index.less';

import { Scheduler } from './scheduler/scheduler.component';

ReactDOM.render(
    <div>
        <Scheduler></Scheduler>
    </div>,
    document.getElementById("app")
);