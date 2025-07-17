import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Account } from '../model/account.model';
import { AdministrationService } from '../administration.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Wallet } from '../../tour-shopping/model/wallet.model';
import { NotificationService } from 'src/app/shared/notification.service';
import { NotificationType } from 'src/app/shared/model/notificationType.enum';

@Component({
  selector: 'xp-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  account: Account[] = [];
  wallets: Wallet[] = [];
  isLoading = false;
  selectedWallet: Wallet | null = null;
  showWalletPopup = false;

  constructor(private service: AdministrationService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadAccount();
  }

  loadAccount(): void {
    this.isLoading = true;
    this.service.getAccount().subscribe({
      next: (result: PagedResults<Account>) => {
        this.account = result.results;
        this.isLoading = false;
        this.loadWallets();
        //console.log(this.account);
        // this.notificationService.notify({ message:'Data loaded successfully!', 'Close', {
        //   duration: 3000,
        //   panelClass:"succesful"
        // });
      },
      error: (err: any) => {
        console.log(err);
        this.isLoading = false;
        this.notificationService.notify({ message: 'Failed to load data. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
      }
    });
  }

  getAccount(): void {
    this.loadAccount();
  }

  blockAccount(account: Account): void {
    if (confirm('Are you sure you want to block this account?')) {
      this.service.blockAccount(account).subscribe({
        next: (_) => {
          this.getAccount();
          this.notificationService.notify({ message: 'Account blocked successfully!', duration: 3000, notificationType: NotificationType.SUCCESS });
        },
        error: (err: any) => {
          console.log(err);
          this.notificationService.notify({ message: 'Failed to block account. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
        }
      })
    }
  }

  isBlocked(account: Account): boolean {
    return account.isActive === false;
  }

  loadWallets(): void {
    this.service.getAllWallets().subscribe({
      next: (result: PagedResults<Wallet>) => {
        this.wallets = result.results; // Store all wallets
        this.account.forEach(a => a.balance = this.wallets.find(w => w.touristId == a.id)?.balance); // Reset the balance in the account
        console.log(this.account);
      },
      error: (err) => {
        console.log(err);
        this.notificationService.notify({ message: 'Failed to load wallets. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
      }
    });
  }

  showWallet(userId: number): void {
    const wallet = this.wallets.find(w => w.touristId === userId);

    if (!wallet) {
      this.notificationService.notify({ message: 'Wallet not found.', duration: 3000, notificationType: NotificationType.WARNING });
      return;
    }

    this.selectedWallet = { ...wallet }; // Create a copy of the wallet to edit
    this.showWalletPopup = true; // Show the popup
  }

  closePopup(): void {
    this.selectedWallet = null;
    this.showWalletPopup = false; // Hide the popup
  }

  increaseBalance(): void {
    if (this.selectedWallet) {
      this.selectedWallet.balance += 1;
    }
  }

  decreaseBalance(): void {
    if (this.selectedWallet && this.selectedWallet.balance > 0) {
      this.selectedWallet.balance -= 1;
    }
  }

  saveWallet(): void {
    if (this.selectedWallet) {
      this.service.updateWallet(this.selectedWallet).subscribe({
        next: () => {
          this.notificationService.notify({ message: 'Wallet balance updated successfully!', duration: 3000, notificationType: NotificationType.SUCCESS });
          this.loadWallets(); // Refresh the wallets
          this.closePopup();
        },
        error: (err: any) => {
          console.log(err);
          this.notificationService.notify({ message: 'Failed to update wallet. Please try again.', duration: 3000, notificationType: NotificationType.WARNING });
        }
      });
    }
  }

  ensureNonEmptyBalance(): void {
    if (this.selectedWallet && (this.selectedWallet.balance === null || this.selectedWallet.balance === undefined)) {
      this.selectedWallet.balance = 0; // Reset to 0 if empty
    }
  }

}
