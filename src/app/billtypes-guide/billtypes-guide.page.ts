import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle,
  IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent,
  IonButtons, IonButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-billtypes-guide',
  templateUrl: './billtypes-guide.page.html',
  styleUrls: ['./billtypes-guide.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle,
    IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, 
    IonButtons, IonButton
  ]
})
export class BilltypesGuidePage implements OnInit {

  cards = [
    {
      title: 'Ativo',
      description: 'Direito ou valor que ficará disponível para ser incorporado à liquidez no futuro, exemplo: vale-alimentação, pagamento de empréstimo a receber, restituição de imposto, etc...'
    },
    {
      title: 'Passivo',
      description: 'Obrigação ou valor a diminuir da liquidez, exemplo: aluguel, parcela de carro, IPTU, etc...'
    },
    {
      title: 'Caixa',
      description: 'Representa a injeção de valor imediato e disponível na liquidez, por exemplo: saldo de conta em banco.'
    },
    {
      title: 'Liquidez',
      description: 'Representa o seu estado financeiro atual: Liquidez = (Ativo + Caixa) - Passivo.'
    },
    {
      title: 'Pagamento de Cartão',
      description: 'Representa um pagamento (valor a deduzir) do total de contas de cartão de crédito.'
    },
    {
      title: 'Poupança',
      description: 'Refere-se a qualquer valor de reserva ou investido de rápida recuperação.'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

}
