import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-calculate-motor',
  templateUrl: './calculate-motor.component.html',
  styleUrls: ['./calculate-motor.component.css']
})
export class CalculateMotorComponent implements OnInit {
  // Dados de entrada do motor
  potenciaCV: number = 5; // Exemplo padrão
  rendimento: number = 0.85;
  fatorPotencia: number = 0.85;
  ipIn: number = 7;
  tp: number = 1;
  trb: number = 1;
  tensao: number = 220;
  quedaTensao: number = 4; // %

  wegCatalogo: any = null;
  fusiveisCatalogo: any = null;

  // Resultados dos cálculos
  contatores: string = '';
  fusivel: string = '';
  releTermico: string = '';
  condutor: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get('/assets/weg_catalogo_completo.json').subscribe({
      next: (data) => this.wegCatalogo = data,
      error: () => this.wegCatalogo = null
    });
    this.http.get('/assets/fusiveis_catalogo.json').subscribe({
      next: (data) => this.fusiveisCatalogo = data,
      error: () => this.fusiveisCatalogo = null
    });
  }

  calcularComponentes() {
    // Corrente nominal (IN) = (Potência * 736) / (V * rendimento * FP)
    const potenciaW = this.potenciaCV * 736;
    const corrente = potenciaW / (Math.sqrt(3) * this.tensao * this.rendimento * this.fatorPotencia);


    if (!this.wegCatalogo) {
      this.contatores = 'Catálogo WEG não carregado.';
      this.fusivel = '';
      return;
    }

    // Seleção do contator mais adequado
    const produtos = this.wegCatalogo.produtos;
    let melhorContator: any = null;

    // Procurar contator que atenda a potência e tensão
    for (const produto of produtos) {
      if (produto.tipo && produto.tipo.toLowerCase().includes('contator')) {
        for (const pt of produto.potencia_tensao || []) {
          // Considera tensão "220" ou "220/230" como equivalente
          const tensoes = pt.tensao_V.split('/').map((t: string) => t.trim());
          if (tensoes.includes(this.tensao.toString()) && this.potenciaCV <= pt.potencia_cv) {
            if (!melhorContator || pt.potencia_cv < melhorContator.potencia_cv) {
              melhorContator = {
                modelo: produto.modelo,
                linha: produto.linha,
                corrente: produto.corrente_AC3_A,
                potencia_cv: pt.potencia_cv
              };
            }
          }
        }
      }
    }

    if (melhorContator) {
      this.contatores = `Modelo: ${melhorContator.modelo} (${melhorContator.linha}) - Corrente: ${melhorContator.corrente}A para ${melhorContator.potencia_cv}CV`;
    } else {
      this.contatores = 'Nenhum contator adequado encontrado.';
    }

    // Relé térmico: 0,9 a 1,05 x IN
    const faixaMin = +(corrente * 0.9).toFixed(2);
    const faixaMax = +(corrente * 1.05).toFixed(2);
    let modeloRele = '';
    // Procurar relé térmico adequado no catálogo
    for (const produto of produtos) {
      if (produto.tipo && produto.tipo.toLowerCase().includes('relé de sobrecarga')) {
        // faixa_corrente_A pode ser "min-max"
        const faixa = produto.faixa_corrente_A?.split('-').map((v: string) => parseFloat(v.trim()));
        if (faixa && faixa.length === 2) {
          if (faixa[0] <= faixaMin && faixa[1] >= faixaMax) {
            modeloRele = `${produto.modelo} (${produto.linha}) - faixa: ${produto.faixa_corrente_A}A`;
            break;
          }
        }
      }
    }
    if (modeloRele) {
      this.releTermico = `Relé térmico sugerido: ${modeloRele}`;
    } else {
      this.releTermico = `Relé térmico: ${faixaMin} a ${faixaMax} A (faixa)`;
    }
    // Seleção do fusível mais adequado
    if (!this.fusiveisCatalogo) {
      this.fusivel = 'Catálogo de fusíveis não carregado.';
    } else {
      // Seleciona fusível com corrente imediatamente acima da corrente nominal
      const fusiveis = this.fusiveisCatalogo.fusiveis || [];
      // Considera apenas fusíveis com tensão igual ou superior à do motor
      // Extrai valor numérico da tensão do fusível e compara
      const tensaoMotor = this.tensao;
      // Corrente do fusível deve ser >= corrente nominal do motor
      let melhorFusivel: any = null;
      for (const fusivel of fusiveis) {
        // Extrai valor numérico da corrente
        const correnteFusivel = parseFloat((fusivel.corrente || '').toString().replace(/[^\d.]/g, ''));
        // Extrai valor numérico da tensão do fusível
        const tensaoFusivel = parseFloat((fusivel.tensao || '').toString().replace(/[^\d.]/g, ''));
        if (!isNaN(correnteFusivel) && correnteFusivel >= corrente && !isNaN(tensaoFusivel) && tensaoFusivel >= tensaoMotor) {
          if (!melhorFusivel || correnteFusivel < parseFloat(melhorFusivel.corrente)) {
            melhorFusivel = fusivel;
          }
        }
      }
      if (melhorFusivel) {
        this.fusivel = `Fusível sugerido: ${melhorFusivel.referencia} (${melhorFusivel.tipo}, ${melhorFusivel.classe}) - ${melhorFusivel.corrente} / ${melhorFusivel.tensao}, código: ${melhorFusivel.codigo}`;
      } else {
        this.fusivel = 'Nenhum fusível adequado encontrado.';
      }
    }
    // Seleção do condutor conforme tabela fornecida
    const tabelaCondutores = [
      { bitola: '0,5 mm²', corrente: 10 },
      { bitola: '0,75 mm²', corrente: 13 },
      { bitola: '1 mm²', corrente: 16 },
      { bitola: '1,5 mm²', corrente: 20 },
      { bitola: '2,5 mm²', corrente: 28 },
      { bitola: '4 mm²', corrente: 37 },
      { bitola: '6 mm²', corrente: 48 },
      { bitola: '10 mm²', corrente: 66 },
      { bitola: '16 mm²', corrente: 88 },
      { bitola: '25 mm²', corrente: 117 },
      { bitola: '35 mm²', corrente: 144 },
      { bitola: '50 mm²', corrente: 175 },
      { bitola: '70 mm²', corrente: 222 },
      { bitola: '95 mm²', corrente: 269 },
      { bitola: '120 mm²', corrente: 312 },
      { bitola: '150 mm²', corrente: 358 },
      { bitola: '185 mm²', corrente: 408 },
      { bitola: '240 mm²', corrente: 481 }
    ];
    const condutorEncontrado = tabelaCondutores.find(c => corrente <= c.corrente);
    if (condutorEncontrado) {
      this.condutor = condutorEncontrado.bitola;
    } else {
      this.condutor = 'Consultar tabela para bitolas maiores';
    }
  }
}
