import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import {
    Calendar,
    GoogleApi
} from '../google-api';
import { ScheduleItem, SchedulerEvent } from './schedule-item.component';
import { InputLabel } from '@material-ui/core';
import {
    forkJoin,
    of as observableOf
} from 'rxjs';
import {
    catchError,
    tap
} from 'rxjs/operators';

export class Scheduler extends React.Component<Props, State> {

    //--------------------------------------------------
    // Private
    //--------------------------------------------------
    private readonly _googleApi: GoogleApi;

    //--------------------------------------------------
    // PUBLIC
    //--------------------------------------------------
    public constructor(props: Props) {
        super(props);

        this.state = {};
        this._googleApi = new GoogleApi((window as any).apiKey, (window as any).clientId);
    }



    /**
     *
     */
    public componentDidMount(): void {

        this._googleApi.signedInStatus().subscribe(isSignedIn => {
            this.setState({ isLoggedIn: isSignedIn });

            if (isSignedIn) {
                this._googleApi.getWriteableCalendars().subscribe(calendars => this.setState({ calendars: calendars }));
            }
        })


        this._googleApi.init();
    }



    /**
     *
     */
    public render(): React.ReactNode {
        return (
        <div>
            <AppBar>
                <Typography variant="h6" color="inherit" style={{ margin: '10px' }}>
                    Goggle Calendar Scheduler
                </Typography>
            </AppBar>
            <div style={{ marginTop: '100px' }}>
                { this.state.isLoggedIn ? this.renderCalendarSelect() : undefined }
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                    {this.renderExistingEvents()}
                </div>
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                    {this.renderScheduler()}
                </div>
                {this.renderAuthButton()}
            </div>
        </div>);
    }

    //--------------------------------------------------
    // PRIVATE
    //--------------------------------------------------
    /**
     *
     */
    private onClick_addEvent(): void {
        const newEvents = [...(this.state.newEvents || [])];
        newEvents.push({
            date: new Date(),
            id: Math.random().toString(),
            name: 'new event'
        });

        this.setState({ newEvents: newEvents });
    }



    /**
     *
     */
    private onClick_save(): void {

        if (!this.state.selectedCalendarId) {
            return;
        }

        const calendarId = this.state.selectedCalendarId;
        const existingItems = [...(this.state.existingEvents || [])];
        const newItems = [...(this.state.newEvents || [])];

        const addObservables = (this.state.newEvents || []).map(event => {
            return this._googleApi.addEvent(calendarId, {
                name: event.name,
                startTime: event.date
            }).pipe(
                catchError(error => {
                    return observableOf(undefined);
                }),
                tap(savedItem => {
                    if (savedItem) {
                        existingItems.push(event);
                        this.setState({ existingEvents: existingItems });

                        const removeAt = newItems.findIndex(a => a.id === event.id);
                        console.log(removeAt);
                        if (removeAt > -1) {
                            newItems.splice(removeAt, 1);
                            this.setState({ newEvents: newItems });
                        }
                    }
                })
            );
        });

        forkJoin(addObservables).subscribe(a => {

        }, error => {
            console.error(error);
        });
    }



    /**
     *
     */
    private onChange_calendar(event: React.ChangeEvent<HTMLSelectElement> ): void {

        const calendarId = event.target.value;
        if (calendarId) {
            this._googleApi.getSchedulerEventList(calendarId).subscribe(events => {

                const schedulerEvents: SchedulerEvent[] = (events || []).map((a, i) => {
                    const scheduleEvent: SchedulerEvent = {
                        date: a.start,
                        id: i.toString(),
                        name: a.summary.replace(/^DEMO-EVENT:/g, '')
                    };
                    return scheduleEvent;
                });

                this.setState({ existingEvents: schedulerEvents });
            });
        }

        this.setState({ selectedCalendarId: event.target.value });
    }



    /**
     *
     */
    private onChange_newEvent(event: SchedulerEvent): void {

        const newEvents = [...(this.state.newEvents || [])];
        const index = newEvents.findIndex(a => a.id === event.id);
        if (index > -1) {
            newEvents[index] = event;
            this.setState({ newEvents: newEvents });
        }
    }



    /**
     *
     */
    private onClick_signIn(): void {
        this._googleApi.signIn();
    }



    /**
     *
     */
    private onClick_signOut(): void {
        this._googleApi.signOut();
    }



    /**
     *
     */
    private renderAuthButton(): React.ReactNode {
        if (this.state.isLoggedIn) {
            return (
            <Button variant="outlined" onClick={() => this.onClick_signOut()}>
                Sign Out
            </Button>)
        } else {
            return (
            <Button variant="outlined" onClick={() => this.onClick_signIn()}>
                Sign In
            </Button>)
        }
    }



    /**
     *
     */
    private renderCalendarSelect(): React.ReactNode {

        return (
        <FormControl style={{minWidth: '300px'}}>
            <InputLabel htmlFor='cal-select'>Calendar</InputLabel>
            <Select
                onChange={e => this.onChange_calendar(e)}
                value={this.state.selectedCalendarId || ''}
                inputProps={{id: 'cal-select'}}>
                {(this.state.calendars || []).map(cal => <MenuItem key={cal.id} value={cal.id}>{cal.summary}</MenuItem>)}
            </Select>
        </FormControl>);
    }



    /**
     *
     */
    private renderExistingEvents(): React.ReactNode | undefined {

        if (!this.state.existingEvents || this.state.existingEvents.length < 1) {
            return undefined;
        }

        const items: React.ReactNode[] = (this.state.existingEvents || []).map((scheduledEvent, i) => {
            const item: React.ReactNode =
            <div key={i} style={{ marginBottom: '10px' }}>
                <ScheduleItem schedulerEvent={scheduledEvent} readonly={true}></ScheduleItem>
            </div>

            return item;
        });

        return (
        <Card>
            <CardHeader title="Existing Events">
            </CardHeader>
            <CardContent>
                {items}
            </CardContent>
        </Card>);
    }



    /**
     *
     */
    private renderScheduler(): React.ReactNode {
        if (this.state.isLoggedIn) {

            let cardContent: React.ReactNode | React.ReactNode[];
            let actionContent: React.ReactNode;

            if (this.state.selectedCalendarId) {
                cardContent = (this.state.newEvents || []).map(item => {
                    return (
                        <ScheduleItem
                            key={item.id}
                            readonly={false}
                            schedulerEvent={item}
                            onUpdateEvent={e => this.onChange_newEvent(e)}>
                        </ScheduleItem>);
                });
                actionContent =
                <div>
                    <Button size="small" onClick={() => this.onClick_addEvent()}>Add Event</Button>
                    <Button size="small"
                        onClick={() => this.onClick_save()}
                        disabled={(this.state.newEvents || []).length < 1}>Save</Button>
                </div>
            } else {
                cardContent =
                <div>
                    Select a calendar to continue...
                </div>
                actionContent = <div></div>
            }

            return (
            <Card>
                <CardContent>
                    {cardContent}
                </CardContent>
                <CardActions>
                    {actionContent}
                </CardActions>
            </Card>);
        } else {
            return (
            <div>
                Sign in to Google to continue...
            </div>);
        }
    }
}

export type Props = {

}

export type State = {
    calendars?: Calendar[];
    existingEvents?: SchedulerEvent[];
    isLoggedIn?: boolean;
    newEvents?: SchedulerEvent[];
    selectedCalendarId?: string;
}

