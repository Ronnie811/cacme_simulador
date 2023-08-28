import React, {useEffect, useState } from "react";

const App = () => {
  const [creditType, setCreditType] = useState("Consumo");
  const [amount, setAmount] = useState(0);
  const [loanTerm, setLoanTerm] = useState(0);
  const [paymentType, setPaymentType] = useState("Cuota fija");
  const [effectiveRate, setEffectiveRate] = useState(0);
  const [amortizationTable, setAmortizationTable] = useState([]);
  const [totalCapital, setTotalCapital] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [nominalRate, setNominalRate] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [pnlAmortizacionStyle, setPnlAmortizacionStyle] = useState("hidden");
  

  const handleQuote = () => {
    setClickCount(clickCount+1);
    document.getElementById("pnl-amortizacion").classList.remove("hidden");
  };

  useEffect(() => {
    let nominalRate;
    switch (creditType) {
      case "Consumo":
        nominalRate = 10;
        break;
      case "Vivienda":
        nominalRate = 10;
        break;
      case "Microcrédito":
        nominalRate = 21;
        break;
      case "Comercial":
        nominalRate = 10;
        break;
      default:
        return;
    }
    setNominalRate(nominalRate)

    const rate = (1 + (nominalRate / 100) / 12) ** 12 - 1;
    setEffectiveRate(rate * 100);

    let table = [];
    let principal = Number(amount); // Asegurándonos de que 'principal' sea un número.
    const monthlyRate = effectiveRate / 100 / 12;
    
    // Para cuota fija
    let fixedPayment = 0;
    if (paymentType === "Cuota fija") {
      fixedPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1);
    }
  
    // Para Capital fijo, el pago de capital es constante
    const constantPrincipalPayment = (paymentType === "Capital fijo") ? principal / loanTerm : 0;
  
    let totalCapital = 0;
    let totalInterest = 0;
    let totalPayment = 0;
  
    for (let i = 1; i <= loanTerm; i++) {
      let interestPayment = principal * monthlyRate; // Interés del mes
      let principalPayment;
  
      if (paymentType === "Cuota fija") {
        principalPayment = fixedPayment - interestPayment; // Capital del mes
      } else if (paymentType === "Capital fijo") {
        principalPayment = constantPrincipalPayment; // Capital constante en cada cuota
        fixedPayment = interestPayment + principalPayment; // En este caso, la cuota es la suma del interés y el capital
      }
  
      principal -= principalPayment; // Actualizamos el capital pendiente
  
      table.push({
        Nro: i,
        Capital: principalPayment,
        Interes: interestPayment,
        Cuota: fixedPayment,
        Saldo: principal
      });
  
      totalCapital += principalPayment;
      totalInterest += interestPayment;
      totalPayment += fixedPayment;
    }
  
    setTotalCapital(totalCapital);
    setTotalInterest(totalInterest);
    setTotalPayment(totalPayment);
    setAmortizationTable(table);
  
  }, [clickCount]); // Dependen de estas variables
  
  
  
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Cotizador de crédito</h1>
      
      <form>
        <div className="mb-4">
          <label>Tipo de crédito: </label>
          <select className="border" onChange={e => {setCreditType(e.target.value);document.getElementById("pnl-amortizacion").classList.add("hidden")}}>
            <option>Consumo</option>
            <option>Vivienda</option>
            <option>Microcrédito</option>
            <option>Comercial</option>
          </select>
        </div>

        <div className="mb-4 bg-red-500">
          {/* Ícono de advertencia y mensaje aquí */}
        </div>
        
        <div className="mb-4">
          <label>Monto: </label>
          <input type="number" className="border" onChange={e => setAmount(Number(e.target.value))} />
          {/* Ícono de información aquí */}
        </div>

        <div className="mb-4">
          <label>Plazo de pago: </label>
          <input type="number" className="border" onChange={e => setLoanTerm(Number(e.target.value))} />
        </div>

        <div className="mb-4">
          <input type="radio" id="fixed" name="paymentType" value="Cuota fija" onChange={e => setPaymentType(e.target.value)} />
          <label htmlFor="fixed">&nbsp;Cuota fija&nbsp;&nbsp;&nbsp;&nbsp;</label>
          
          <input type="radio" id="variable" name="paymentType" value="Capital fijo" onChange={e => setPaymentType(e.target.value)} />
          <label htmlFor="variable">&nbsp;Capital fijo</label>
        </div>

        <button type="button"  className="border p-2 rounded-full" onClick={handleQuote}>
          Cotizar
        </button>
      </form>

      <div id="pnl-amortizacion" className={pnlAmortizacionStyle}>
        <h2>Tasa Nominal: {nominalRate}</h2>
        <h2>Tasa Efectiva: {effectiveRate.toFixed(2)}%</h2>
        {/* ...Otras informaciones como fechas... */}
        <table className="border p-5">
          <thead>
            <tr>
              <th>Nro</th>
              <th>Capital</th>
              <th>Interés</th>
              <th>Cuota</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {amortizationTable.map((row, index) => (
              <tr key={index}>
                <td>{row.Nro}</td>
                <td>{row.Capital.toFixed(2)}</td>
                <td>{row.Interes.toFixed(2)}</td>
                <td>{row.Cuota.toFixed(2)}</td>
                <td>{Math.abs(row.Saldo.toFixed(2))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
          <tr>
            <td>Total:</td>
            <td>{loanTerm}</td>
            <td>{totalCapital.toFixed(2)}</td>
            <td>{totalInterest.toFixed(2)}</td>
            <td>{totalPayment.toFixed(2)}</td>
            
          </tr>
        </tfoot>
        </table>
      </div>
    </div>
  );
}

export default App;
