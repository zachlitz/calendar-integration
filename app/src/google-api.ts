import {
    BehaviorSubject,
    Subject,
    Observable
} from 'rxjs';

// This is loaded in a script tag in the html.
const gapi: any = (window as any).gapi || {};

export class GoogleApi {

    //--------------------------------------------------
    // Private
    //--------------------------------------------------
    private readonly _apiKey: string;
    private readonly _clientKey: string;
    private readonly _initializedSubject = new BehaviorSubject<boolean>(false);
    private readonly _signedInStatusSubject = new Subject<boolean>();



    //--------------------------------------------------
    // PUBLIC
    //--------------------------------------------------
    public constructor(apiKey: string, clientId: string) {
        this._apiKey = apiKey;
        this._clientKey = clientId;
    }



    /**
     *
     */
    public addEvent(calendarId: string, event: AddEvent): Observable<any> {

        const name = `DEMO-EVENT:${event.name}`;
        const endTime = new Date(event.startTime.getTime() + 60*60*1000);


        const resource = {
            summary: name,
            description: name,
            end: {
                dateTime: endTime.toISOString()
            },
            start: {
                dateTime:  event.startTime.toISOString()
            }
        }

        return new Observable(subscriber => {
            return gapi.client.calendar.events.insert({
                calendarId: calendarId,
                resource: resource
            }).then((response: any) => {

                if (response && response.result) {
                    subscriber.next(response.result);
                } else {
                    subscriber.next(undefined);
                }
                subscriber.complete();
            }).catch((error: any) => {
                subscriber.error(error);
            })
        });
    }



    /**
     *
     */
    public getSchedulerEventList(calendarId: string): Observable<EventItem[]> {
        return new Observable(subscriber => {
            return gapi.client.calendar.events.list({
                calendarId: calendarId,
                maxResults: 100,
                q: 'DEMO-EVENT:'
            }).then((response: any) => {

                if (response && response.result) {

                    const items: EventItem[] = (response.result.items || []).map((item: any) => {
                        const eventItem: EventItem = {
                            start: new Date(item.start.dateTime),
                            summary: item.summary
                        };
                        return eventItem;
                    });
                    subscriber.next(items);
                } else {
                    subscriber.next([]);
                }
                subscriber.complete();
            }).catch((error: any) => {
                subscriber.error(error);
            })
        });
    }




    /**
     *
     */
    public getWriteableCalendars(): Observable<Calendar[]> {
        return new Observable(subscriber => {
            gapi.client.calendar.calendarList.list({
                maxResults: 100,
            }).then((response: any) => {

                const acl: { [key: string]: boolean } = {
                    owner: true,
                    writer: true
                };

                let calendars: Calendar[] = [];
                if (response && response.result && response.result.items) {
                    calendars = (response.result.items || []).filter((cal: any) => acl[cal.accessRole] === true);
                }
                subscriber.next(calendars);
                subscriber.complete();
            }).catch((error: any) => {
                subscriber.error(error);
            })
        });
    }



    /**
     *
     */
    public init(): void {
        gapi.load('client:auth2', () => this.onLoaded());
    }



    /**
     *
     */
    public initialized(): Observable<boolean> {
        return this._initializedSubject;
    }



    /**
     *
     */
    public iSignedIn(): boolean {
        if (!gapi || !gapi.auth2) {
            return false;
        }

        return gapi.auth2.getAuthInstance().isSignedIn.get();
    }



    /**
     *
     */
    public signedInStatus(): Observable<boolean> {
        return this._signedInStatusSubject;
    }



    /**
     *
     */
    public signIn(): void {
        gapi.auth2.getAuthInstance().signIn();
    }



    /**
     *
     */
    public signOut(): void {
        gapi.auth2.getAuthInstance().signOut();
    }




    //--------------------------------------------------
    // PRIVATE
    //--------------------------------------------------
    /**
     *
     */
    private onLoaded(): void {
        gapi.client.init({
            apiKey: this._apiKey,
            clientId: this._clientKey,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
            scope: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events"
        }).then(() => {
            gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn: any) => {
                this._signedInStatusSubject.next(isSignedIn);
            });
            this._signedInStatusSubject.next(gapi.auth2.getAuthInstance().isSignedIn.get());
            this._initializedSubject.next(true);
        }).catch((error: any) => {
            console.log(error);
        });
    }
}

export type Calendar = {
    id: string;
    summary: string;
};

export type AddEvent = {
    name: string;
    startTime: Date;
};

export type EventItem = {
    summary: string;
    start: Date;
};