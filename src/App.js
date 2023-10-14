import React, {useEffect, useState, useRef } from "react";

const creditConfigs = [
  {
    "tipoCredito": "Consumo",
    "interes": 15.5,
    "montoMinimo": 1,
    "montoMaximo": 1000000
  },
  {
    "tipoCredito": "Microcrédito minorista",
    "interes": 24.0,
    "montoMinimo": 100,
    "montoMaximo": 1000
  },
  {
    "tipoCredito": "Micrecrédito acumulación simple",
    "interes": 22.0,
    "montoMinimo": 1001,
    "montoMaximo": 10000
  },
  {
    "tipoCredito": "Micrecrédito acumulación ampliada",
    "interes": 20.0,
    "montoMinimo": 10001,
    "montoMaximo": 100000
  }
];

const App = () => {
  const [creditType, setCreditType] = useState(creditConfigs[0].tipoCredito);
  const [currentCreditConfig, setCurrentCreditConfig] = useState(creditConfigs[0]);
  const [amount, setAmount] = useState(0);
  const [loanTerm, setLoanTerm] = useState(0);
  const [paymentType, setPaymentType] = useState("Cuota fija");
  const [effectiveRate, setEffectiveRate] = useState(0);
  const [amortizationTable, setAmortizationTable] = useState([]);
  const [totalCapital, setTotalCapital] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [pnlAmortizacionStyle, setPnlAmortizacionStyle] = useState("hidden");
  const [errorMessage, setErrorMessage] = useState("");
  const errorTimeout = useRef(null);
  

  const handleQuote = () => {
    const errors = [];
    if (amount < currentCreditConfig.montoMinimo || amount > currentCreditConfig.montoMaximo) {
      errors.push(`El monto debe estar entre ${currentCreditConfig.montoMinimo} y ${currentCreditConfig.montoMaximo}`);
    }
    if (loanTerm <= 0) {
      errors.push("El plazo de pago en meses debe ser mayor que cero.");
    }
    if (loanTerm > 1200) {
      errors.push("El plazo de pago en meses no puede ser mayor a 1200.");
    }

    if(errors.length > 0){
      setErrorMessage(errors);
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
      errorTimeout.current = setTimeout(() => {
        setErrorMessage([]);
      }, 10000);
      return;
    }

    setClickCount(clickCount+1);
    document.getElementById("pnl-amortizacion").classList.remove("hidden");
  };

  const handleCloseError = () => {
    setErrorMessage("");
    if (errorTimeout.current) clearTimeout(errorTimeout.current);
  }

  const handleChangeCreditType = (e) => {
    const creditConfig = creditConfigs[e.target.value];
    setCreditType(creditConfig.tipoCredito)
    
    setCurrentCreditConfig(creditConfig);
    console.log("min, max",creditConfig.montoMinimo,creditConfig.montoMaximo);
  }

  useEffect(() => {    
    
    const rate = (1 + (currentCreditConfig.interes / 100) / 12) ** 12 - 1;
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
    <div className="container mx-auto p-4 relative">
      {errorMessage.length > 0 && (
      <div className="absolute top-0 right-0 bg-red-500 text-white p-4 rounded-lg shadow-lg cursor-pointer z-10" onClick={handleCloseError}>
        <span className="absolute top-2 right-2 font-bold cursor-pointer" title="Cerrar">✕</span>
        <ul className="mt-2 mr-2">
          {errorMessage.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    )}
      <h1 className="text-3xl font-bold mb-4">Cotizador de crédito</h1>
      
      <form className="flex flex-col w-1/3 mb-10">
        <div className="mb-5 flex flex-col">
          <label>Tipo de crédito </label>
          <select className="border" onChange={e => { handleChangeCreditType(e); document.getElementById("pnl-amortizacion").classList.add("hidden") }}>
            {creditConfigs.map((config, index) => (
              <option key={index} value={index}>{config.tipoCredito}</option>
            ))}
          </select>
        </div>

        <div className="mb-5 bg-sky-200 flex rounded-lg">
          <div className="ml-5">ℹ️</div>
          <div className="ml-3"> Monto mínimo: {currentCreditConfig.montoMinimo}, Monto máximo: {currentCreditConfig.montoMaximo}</div>
        </div>
        
        <div className="mb-5 flex flex-col">
          <label>Monto </label>
          <input type="number" className="border" onChange={e => {setAmount(Number(e.target.value));document.getElementById("pnl-amortizacion").classList.add("hidden");}} />
        </div>

        <div className="mb-5 flex flex-col">
          <label>Plazo de pago en meses</label>
          <input type="number" className="border" onChange={e => {setLoanTerm(Number(e.target.value));document.getElementById("pnl-amortizacion").classList.add("hidden");}} />
        </div>

        <div className="mb-5">
          <input type="radio" id="fixed" name="paymentType" value="Cuota fija" checked={paymentType === "Cuota fija"} onChange={e => setPaymentType(e.target.value)} />
          <label htmlFor="fixed">&nbsp;Cuota fija&nbsp;&nbsp;&nbsp;&nbsp;</label>
          
          <input type="radio" id="variable" name="paymentType" value="Capital fijo" checked={paymentType === "Capital fijo"} onChange={e => setPaymentType(e.target.value)} />
          <label htmlFor="variable">&nbsp;Capital fijo</label>
        </div>

        <button type="button"  className="border p-2 rounded-full bg-indigo-100" onClick={handleQuote}>
          Cotizar
        </button>
      </form>
      <div className="mt-5">
      <div id="pnl-amortizacion" className={pnlAmortizacionStyle}>
        <h2>Tasa Nominal: {currentCreditConfig.interes}</h2>
        <h2>Tasa Efectiva: {effectiveRate.toFixed(2)}%</h2>
        <div className="grid grid-cols-5 border mt-5">
          {/* Encabezado */}
          <div className="col-span-1 font-bold p-2">Nro</div>
          <div className="col-span-1 font-bold p-2">Capital</div>
          <div className="col-span-1 font-bold p-2">Interés</div>
          <div className="col-span-1 font-bold p-2">Cuota</div>
          <div className="col-span-1 font-bold p-2">Saldo</div>

          {/* Cuerpo */}
          {amortizationTable.map((row, index) => (
            <React.Fragment key={index}>
              <div className={`col-span-1 p-2 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>{row.Nro}</div>
              <div className={`col-span-1 p-2 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>{row.Capital.toFixed(2)}</div>
              <div className={`col-span-1 p-2 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>{row.Interes.toFixed(2)}</div>
              <div className={`col-span-1 p-2 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>{row.Cuota.toFixed(2)}</div>
              <div className={`col-span-1 p-2 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>{Math.abs(row.Saldo.toFixed(2))}</div>
            </React.Fragment>
          ))}

          {/* Pie */}
          <div className="col-span-1 font-bold p-2 bg-gray-300">Total:</div>
          <div className="col-span-1 font-bold p-2 bg-gray-300">{loanTerm}</div>
          <div className="col-span-1 font-bold p-2 bg-gray-300">{totalCapital.toFixed(2)}</div>
          <div className="col-span-1 font-bold p-2 bg-gray-300">{totalInterest.toFixed(2)}</div>
          <div className="col-span-1 font-bold p-2 bg-gray-300">{totalPayment.toFixed(2)}</div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;
