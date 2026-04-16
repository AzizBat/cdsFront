import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-action-popup',
  templateUrl: './action-popup.component.html',
  styleUrls: ['./action-popup.component.css']
})
export class ActionPopupComponent implements OnChanges, OnDestroy {
  @Input() visible = false;
  @Input() message = '';
  @Input() primaryLabel = 'Oui';
  @Input() secondaryLabel = 'Deconnecter';
  @Input() countdownStart = 30;

  @Output() primary = new EventEmitter<void>();
  @Output() secondary = new EventEmitter<void>();

  countdown = 30;
  private timerId: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      if (this.visible) {
        this.startCountdown();
      } else {
        this.clearTimer();
      }
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  onPrimary(): void {
    this.clearTimer();
    this.primary.emit();
  }

  onSecondary(): void {
    this.clearTimer();
    this.secondary.emit();
  }

  private startCountdown(): void {
    this.clearTimer();
    this.countdown = this.countdownStart;
    this.timerId = setInterval(() => {
      this.countdown = this.countdown - 1;
      if (this.countdown <= 0) {
        this.onSecondary();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
