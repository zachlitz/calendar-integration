import * as React from 'react';

import DateFnsUtils from '@date-io/date-fns';
import TextField from '@material-ui/core/TextField';
import {
    DatePicker,
    MuiPickersUtilsProvider,
    TimePicker
} from 'material-ui-pickers';

export class ScheduleItem extends React.Component<Props, State> {

    //--------------------------------------------------
    // PUBLIC
    //--------------------------------------------------
    public constructor(props: Props) {
        super(props);

        this.state = {
            date: null as any as undefined
        };
    }



    /**
     *
     */
    public static getDerivedStateFromProps(props: Props, state: State): State {
        return {
            date: props.schedulerEvent ? props.schedulerEvent.date : undefined,
            eventName: props.schedulerEvent ? props.schedulerEvent.name : undefined
        }
    }



    /**
     *
     */
    public render(): React.ReactNode {

        const readonly = this.props.readonly;

        return <div>
            <TextField
                disabled={readonly}
                label="Event Name"
                onChange={e => this.onChange_name(e as React.ChangeEvent<HTMLInputElement>)}
                value={this.props.schedulerEvent.name}/>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                    disabled={readonly}
                    label="Event Date"
                    value={this.props.schedulerEvent.date}
                    onChange={e => this.onChange_DateTime(e)}></DatePicker>
                <TimePicker
                    disabled={readonly}
                    label="Start Time"
                    value={this.props.schedulerEvent.date}
                    onChange={e => this.onChange_DateTime(e)}></TimePicker>
            </MuiPickersUtilsProvider>
        </div>
    }

    //--------------------------------------------------
    // PRIVATE
    //--------------------------------------------------
    /**
     *
     */
    private onChange_name(event: React.ChangeEvent<HTMLInputElement>): void {
        this.updateEvent({ name: event.target.value });
    }



    /**
     *
     */
    private onChange_DateTime(date: Date | undefined): void {
        this.updateEvent({ date: date });
    }



    /**
     *
     */
    private updateEvent(event: {[P in keyof SchedulerEvent ]?: SchedulerEvent[P]}): void {
        const newEvent = Object.assign({}, this.props.schedulerEvent, event);
        if (typeof this.props.onUpdateEvent === 'function') {
            this.props.onUpdateEvent(newEvent);
        }
    }
}

export type Props = {
    readonly: boolean;
    schedulerEvent: SchedulerEvent
    onUpdateEvent?: (event: SchedulerEvent) => void;
}

export type State = {

}

export type SchedulerEvent = {
    id: string;
    date: Date;
    name: string;
}