import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './live-notification.component.html',
  styleUrls: ['./live-notification.component.css']
})
export class LiveNotificationComponent implements OnInit, OnChanges {
  @Input() notifications: any[] = [];
  @Output() showedAll: EventEmitter<any> = new EventEmitter<any>();
  currentNotification: any | null = null;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.showNextNotification();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['notifications']) {
      this.showNextNotification();
    }
  }

  showNextNotification(): void {
    if (this.notifications.length > 0) {
      this.currentNotification = this.notifications.pop();
      console.log('Showing notification:', this.currentNotification.imagePath);
      this.cdr.detectChanges(); // Obavestite Angular o promeni
    }
  }

  closeNotification(): void {
    this.currentNotification = null;
    if (this.notifications.length < 1) {
      this.showedAll.emit();
    }
    this.showNextNotification();
  }
}
