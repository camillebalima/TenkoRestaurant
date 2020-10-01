import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../shared/order.service';
import { CustomerService } from '../../shared/customer.service';
import { Customer } from '../../shared/customer.model';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { OrderItemsComponent } from '../order-items/order-items.component';
import { ToastrService } from 'ngx-toastr';

import { CurrencyPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
})
export class OrderComponent implements OnInit {
  customerList: Customer[];
  isValid = true;

  constructor(
    public service: OrderService,
    public dialog: MatDialog,
    private customerService: CustomerService,
    private toastr: ToastrService,
    private router: Router,
    private currentRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    let orderID = this.currentRoute.snapshot.paramMap.get('id');
    if (orderID == null) {
      this.resetForm();
    } else {
      this.service.getOrderByID(parseInt(orderID)).then(res => {
        this.service.formData = res.order;
        this.service.orderItems = res.orderDetails;
        console.log(res);
      });
    }
    this.customerService
      .getCustomerList()
      .then((res) => (this.customerList = res as Customer[]));
  }

  resetForm(form?: NgForm): void {
    if (form == null) {
      // form.resetForm();
      this.service.formData = {
        OrderID: 0,
        OrderNo: Math.floor(100000 + Math.random() * 900000),
        CustomerID: 0,
        PaymentMethod: '',
        GrandTotal: 0,
        DeletedOrderItemIDs: ''
      };
    }
    this.service.orderItems = [];
  }

  addOrEditOrderItem(orderItemIndex, OrderID): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.width = '50%';
    dialogConfig.data = { orderItemIndex, OrderID };

    this.dialog
      .open(OrderItemsComponent, dialogConfig)
      .afterClosed()
      .subscribe((res) => this.updateGrandTotal());
  }

  onDeleteOrderItem(orderItemID: number, i: number) {
    if(orderItemID != null){
      this.service.formData.DeletedOrderItemIDs += orderItemID + ",";
    }
    this.service.orderItems.splice(i, 1);
    this.updateGrandTotal();
  }

  updateGrandTotal() {
    this.service.formData.GrandTotal = this.service.orderItems.reduce(
      (prev, curr) => {
        return prev + curr.Total;
      },
      0
    );

    this.service.formData.GrandTotal = parseFloat(
      this.service.formData.GrandTotal.toFixed(2)
    );
  }

  validateForm() {
    this.isValid = true;
    if (this.service.formData.CustomerID == 0) {
      this.isValid = false;
    } else if (this.service.orderItems.length == 0) {
      this.isValid = false;
    }
    return this.isValid;
  }

  onSubmit(form: NgForm) {
    if (this.validateForm()) {
      this.service.saveOrUpdateOrder().subscribe(res => {
        this.resetForm();
        this.toastr.success('Submited Successfully', 'Restaurant App.');
        this.router.navigate(['/orders']);
      });
    }
  }
}
