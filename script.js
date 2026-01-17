// --- Función de utilidad para escapar HTML ---
function escapeHTML(str) {
  str = String(str);
  return str.replace(/[&<>"']/g, function(match) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match];
  });
}

// Lógica para ingresos en billetes (antes en billIncomes.js)
 // --- Variables globales ---
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    window.expenses = expenses; // Para acceso global

    // --- Lógica para ingresos en billetes ---
    function updateBillIncomeTable() {
      const billIncomeBody = document.getElementById('billIncomeBody');
      const billIncomeTotal = document.getElementById('billIncomeTotal');
      let bills = window.getBillIncomes();
      billIncomeBody.innerHTML = '';
      let total = 0;
      bills.forEach((b, idx) => {
        const subtotal = b.type * b.quantity;
        total += subtotal;
        const tr = document.createElement('tr');
        // Billete
        const tdBillete = document.createElement('td');
        tdBillete.textContent = window.getBillLabel(b.type);
        tr.appendChild(tdBillete);
        // Cantidad (editable)
        const tdCantidad = document.createElement('td');
        tdCantidad.textContent = b.quantity;
        tdCantidad.style.cursor = 'pointer';
        tdCantidad.addEventListener('click', function() {
          const input = document.createElement('input');
          input.type = 'number';
          input.className = 'form-control form-control-sm';
          input.value = b.quantity;
          input.min = '1';
          tdCantidad.innerHTML = '';
          tdCantidad.appendChild(input);
          input.focus();
          input.select();
          input.addEventListener('blur', function() {
            const newVal = parseInt(this.value);
            if (!isNaN(newVal) && newVal > 0) {
              window.updateBillIncome(b.type, newVal);
              updateBillIncomeTable();
            } else {
              updateBillIncomeTable();
            }
          });
          input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') this.blur();
          });
        });
        tr.appendChild(tdCantidad);
        // Total
        const tdTotal = document.createElement('td');
        tdTotal.textContent = window.getBillLabel(subtotal);
        tr.appendChild(tdTotal);
        // Botón eliminar
        const tdDelete = document.createElement('td');
        const deleteBtn = document.createElement('i');
        deleteBtn.className = 'fas fa-trash delete-icon';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.title = 'Eliminar ingreso';
        deleteBtn.addEventListener('click', function() {
          window.deleteBillIncome(b.type);
          updateBillIncomeTable();
        });
        tdDelete.appendChild(deleteBtn);
        tr.appendChild(tdDelete);
        billIncomeBody.appendChild(tr);
      });
      billIncomeTotal.textContent = window.getBillLabel(total);
    }

    document.addEventListener('DOMContentLoaded', function() {
      // Inicializar tabla y eventos de ingresos en billetes
      updateBillIncomeTable();
      const billIncomeForm = document.getElementById('billIncomeForm');
      const billType = document.getElementById('billType');
      const billQuantity = document.getElementById('billQuantity');
      billIncomeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const type = parseInt(billType.value);
        const quantity = parseInt(billQuantity.value);
        if (!type || isNaN(quantity) || quantity <= 0) return;
        window.addOrUpdateBillIncome(type, quantity);
        updateBillIncomeTable();
        billIncomeForm.reset();
      });
      // Botón imprimir billetes
      document.getElementById('printBillIncomeBtn').addEventListener('click', function() {
        let html = `<h2 style='text-align:center;'>Ingresos en billetes</h2>`;
        html += `<table border='1' cellspacing='0' cellpadding='5' style='width:100%;margin:20px 0;text-align:center;'>`;
        html += `<tr><th>Billete</th><th>Cantidad</th><th>Valor por billete</th><th>Total</th></tr>`;
        let total = 0;
        window.getBillIncomes().forEach(b => {
          const subtotal = b.type * b.quantity;
          total += subtotal;
          html += `<tr><td>${escapeHTML(window.getBillLabel(b.type))}</td><td>${escapeHTML(b.quantity)}</td><td>${escapeHTML(window.getBillLabel(b.type))}</td><td>${escapeHTML(window.getBillLabel(subtotal))}</td></tr>`;
        });
        html += `<tr><th colspan='3' style='text-align:right;'>Total general:</th><th>${escapeHTML(window.getBillLabel(total))}</th></tr>`;
        html += `</table>`;
        const win = window.open('', '', 'width=900,height=700');
        win.document.write(`<html><head><title>Ingresos en billetes</title></head><body>${html}</body></html>`);
        win.document.close();
        win.print();
      });
      // Botón guardar tabla de billetes como imagen
      document.getElementById('saveBillTableImageBtn').addEventListener('click', function() {
        const table = document.getElementById('billIncomeTable');
        if (!table) {
          alert('No se encontró la tabla de billetes.');
          return;
        }
        html2canvas(table).then(canvas => {
          const link = document.createElement('a');
          link.download = 'tabla_billetes.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        });
      });
    });
    // --- Fin lógica billetes ---

    // --- Imprimir todo: gastos, monedas, billetes, dashboard ---
    document.addEventListener('DOMContentLoaded', function() {
      document.getElementById('printAllBtn').addEventListener('click', async function() {
        // --- Mostrar todos los registros de las tablas antes de imprimir ---
        // Guardar el estado actual de paginación y datos
        let originalRowsPerPage = window.rowsPerPage;
        let originalCurrentPage = window.currentPage;
        let originalExpenses = window.expenses ? [...window.expenses] : [];
        let filteredExpenses = window.expenses ? [...window.expenses] : [];
        // Mostrar todos los gastos
        window.rowsPerPage = 1000000;
        if (typeof updateExpensesTableFiltered === 'function') {
          updateExpensesTableFiltered(filteredExpenses, 1);
        } else if (typeof updateExpensesTable === 'function') {
          updateExpensesTable();
        }
        // Mostrar todos los ingresos en monedas y billetes (si hay paginación)
        if (typeof updateCoinIncomeTable === 'function') updateCoinIncomeTable();
        if (typeof updateBillIncomeTable === 'function') updateBillIncomeTable();

        // --- Asegurarse de que los gráficos estén actualizados y visibles ---
        if (typeof updateCharts === 'function') updateCharts();
        // Activar la pestaña dashboard si no está activa
        const dashboardTab = document.getElementById('dashboard-tab');
        if (dashboardTab && !dashboardTab.classList.contains('active')) {
          dashboardTab.click();
        }
        // Esperar a que los gráficos se rendericen
        await new Promise(res => setTimeout(res, 600));

        // 1. Captura tablas como HTML (limpiando filtros y columna de acciones)
        function prepareTableForPrint(table) {
          const clone = table.cloneNode(true);
          // Eliminar inputs de filtro dentro de encabezados
          clone.querySelectorAll('th .filter-input').forEach(inp => {
            const wrapper = inp.closest('div');
            if (wrapper) wrapper.remove(); else inp.remove();
          });
          // Determinar índice de la columna "Acciones" (por lo general la última)
          const ths = clone.querySelectorAll('thead th');
          let actionsIndex = -1;
          ths.forEach((th, idx) => {
            const txt = th.textContent || '';
            if (/accion/i.test(txt)) actionsIndex = idx;
          });
          if (actionsIndex === -1) actionsIndex = ths.length - 1;
          // Eliminar th de acciones
          if (clone.querySelectorAll('thead th')[actionsIndex]) {
            clone.querySelectorAll('thead th')[actionsIndex].remove();
          }
          // Eliminar la celda de acciones en cada fila del body
          clone.querySelectorAll('tbody tr').forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds[actionsIndex]) tds[actionsIndex].remove();
          });
          // Eliminar botones o iconos residuales
          clone.querySelectorAll('.delete-icon, .btn-delete, .actions').forEach(el => el.remove());
          // Asegurar que no haya inputs visibles
          clone.querySelectorAll('input, select, textarea, button').forEach(el => {
            if (el.tagName.toLowerCase() === 'input' && el.classList.contains('filter-input')) return;
            // Reemplazar inputs por su value para seguridad
            if (el.tagName.toLowerCase() !== 'button') {
              const span = document.createElement('span');
              span.textContent = escapeHTML(el.value || el.textContent || '');
              el.parentNode && el.parentNode.replaceChild(span, el);
            } else {
              el.remove();
            }
          });
          return clone.outerHTML;
        }

        let html = `<h2 style='text-align:center;'>Resumen General</h2>`;
        // Gastos
        const expensesTable = document.getElementById('expensesTable');
        if (expensesTable) {
          html += `<h3 style='text-align:center;'>Gastos</h3>` + prepareTableForPrint(expensesTable);
        }
        // Monedas
        const coinTable = document.getElementById('coinIncomeTable');
        if (coinTable) {
          html += `<h3 style='text-align:center;'>Ingresos en monedas</h3>` + prepareTableForPrint(coinTable);
        }
        // Billetes
        const billTable = document.getElementById('billIncomeTable');
        if (billTable) {
          html += `<h3 style='text-align:center;'>Ingresos en billetes</h3>` + prepareTableForPrint(billTable);
        }
        // 2. Captura gráficas: preferir toBase64Image() de Chart.js y mostrar solo imagen en impresión
        let chartImagesHtml = '';
        const chartIds = ['monthlyChart', 'categoryChart', 'timelineChart', 'incomePieChart','incomeBarChart','cumulativeExpensesChart','monthlyExpensesChart'];
        for (const id of chartIds) {
          const chartEl = document.getElementById(id);
          if (!chartEl) continue;
          let imgData = null;
          try {
            // 1) intentar obtener instancia de Chart.js desde el canvas
            let chartInstance = null;
            if (window.Chart && typeof Chart.getChart === 'function') {
              chartInstance = Chart.getChart(chartEl);
            }
            // 2) fallback: buscar variable global window[id + 'Chart']
            if (!chartInstance && window[id + 'Chart']) chartInstance = window[id + 'Chart'];
            // 3) fallback: buscar window.lineChart / incomeBarChart etc
            if (!chartInstance) {
              for (const key of Object.keys(window)) {
                if (key.toLowerCase().includes(id.toLowerCase()) && window[key] && typeof window[key].toBase64Image === 'function') {
                  chartInstance = window[key];
                  break;
                }
              }
            }
            if (chartInstance && typeof chartInstance.toBase64Image === 'function') {
              imgData = chartInstance.toBase64Image();
            } else if (chartEl.tagName === 'CANVAS') {
              // Canvas directo
              imgData = chartEl.toDataURL('image/png');
            }
          } catch (e) { imgData = null; }

          if (imgData) {
            chartImagesHtml += `<div style='text-align:center; margin: 30px 0;'><img class='chart-print' src='${imgData}' style='max-width:90%;border:1px solid #ccc;' alt='Gráfica' /><div class='chart-screen' style='text-align:center;'>${chartEl.outerHTML}</div></div>`;
            continue;
          }
          // último recurso: html2canvas del elemento contenedor
          try {
            const canvas = await html2canvas(chartEl.parentElement || chartEl, {backgroundColor: null});
            const img = canvas.toDataURL('image/png');
            chartImagesHtml += `<div style='text-align:center; margin: 30px 0;'><img class='chart-print' src='${img}' style='max-width:90%;border:1px solid #ccc;' alt='Gráfica' /><div class='chart-screen' style='text-align:center;'>${chartEl.outerHTML}</div></div>`;
          } catch (e) {}
        }
        if (chartImagesHtml) {
          html = `<h2 style='text-align:center;'>Dashboard</h2>` + chartImagesHtml + '<hr>' + html;
        }
        // 3. Abrir ventana de impresión
        const win = window.open('', '', 'width=1000,height=900');
        win.document.write(`<html><head><title>Impresión completa</title></head><body>${html}</body></html>`);
        win.document.close();
        win.print();
        // --- Restaurar paginación y vista original ---
        window.rowsPerPage = originalRowsPerPage;
        if (typeof updateExpensesTableFiltered === 'function') {
          updateExpensesTableFiltered(filteredExpenses, originalCurrentPage);
        } else if (typeof updateExpensesTable === 'function') {
          updateExpensesTable();
        }
        if (typeof updateCoinIncomeTable === 'function') updateCoinIncomeTable();
        if (typeof updateBillIncomeTable === 'function') updateBillIncomeTable();
      });


      // Initialize date picker
      flatpickr("#expenseDate", {
        dateFormat: "Y-m-d",
        defaultDate: new Date()
      });
      // Mini calendario para el filtro de fecha en la tabla
      if (document.getElementById('dateFilter')) {
        flatpickr("#dateFilter", {
          dateFormat: "Y-m-d",
          allowInput: true,
          altInput: false,
          onChange: function(selectedDates, dateStr) {
            if (typeof filterTable === 'function') filterTable();
          }
        });
      }
      
      // Initialize collapsible cards
      document.querySelectorAll('.collapsible-card .card-header').forEach(header => {
        header.addEventListener('click', function() {
          const card = this.closest('.collapsible-card');
          card.classList.toggle('collapsed');
        });
      });
      
      // Theme toggle functionality
      const themeToggle = document.getElementById('themeToggle');
      const icon = themeToggle.querySelector('i');
      
      themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
          icon.classList.remove('fa-moon');
          icon.classList.add('fa-sun');
          localStorage.setItem('theme', 'dark');
        } else {
          icon.classList.remove('fa-sun');
          icon.classList.add('fa-moon');
          localStorage.setItem('theme', 'light');
        }
      });
      
      // Check for saved theme preference
      if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      }
      
      // Load expenses from localStorage
      expenses = JSON.parse(localStorage.getItem('expenses')) || [];
      
      // Ingresos en monedas
      let coinIncomes = JSON.parse(localStorage.getItem('coinIncomes')) || [];
      const coinIncomeForm = document.getElementById('coinIncomeForm');
      const coinType = document.getElementById('coinType');
      const coinQuantity = document.getElementById('coinQuantity');
      const coinIncomeBody = document.getElementById('coinIncomeBody');
      const coinIncomeTotal = document.getElementById('coinIncomeTotal');

      coinIncomeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const type = coinType.value;
        const quantity = parseInt(coinQuantity.value);
        if (!type || isNaN(quantity) || quantity <= 0) return;
        // Buscar si ya existe ese tipo de moneda
        const existing = coinIncomes.find(c => c.type === type);
        if (existing) {
          existing.quantity += quantity;
        } else {
          coinIncomes.push({ type, quantity });
        }
        localStorage.setItem('coinIncomes', JSON.stringify(coinIncomes));
        updateCoinIncomeTable();
        coinIncomeForm.reset();
      });

      function updateCoinIncomeTable() {
        coinIncomeBody.innerHTML = '';
        let total = 0;
        const coinLabels = { '1000': '$1.000', '500': '$500', '200': '$200', '100': '$100', '50': '$50' };
        coinIncomes.forEach((c, idx) => {
          const value = parseInt(c.type);
          const subtotal = value * c.quantity;
          total += subtotal;
          const tr = document.createElement('tr');
          // Moneda
          const tdMoneda = document.createElement('td');
          tdMoneda.textContent = coinLabels[c.type];
          tr.appendChild(tdMoneda);
          // Cantidad (editable)
          const tdCantidad = document.createElement('td');
          tdCantidad.textContent = c.quantity;
          tdCantidad.style.cursor = 'pointer';
          tdCantidad.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'form-control form-control-sm';
            input.value = c.quantity;
            input.min = '1';
            tdCantidad.innerHTML = '';
            tdCantidad.appendChild(input);
            input.focus();
            input.select();
            input.addEventListener('blur', function() {
              const newVal = parseInt(this.value);
              if (!isNaN(newVal) && newVal > 0) {
                c.quantity = newVal;
                localStorage.setItem('coinIncomes', JSON.stringify(coinIncomes));
                updateCoinIncomeTable();
              } else {
                updateCoinIncomeTable();
              }
            });
            input.addEventListener('keypress', function(e) {
              if (e.key === 'Enter') this.blur();
            });
          });
          tr.appendChild(tdCantidad);
          // Total
          const tdTotal = document.createElement('td');
          tdTotal.textContent = `$${formatNumberWithDots(subtotal)}`;
          tr.appendChild(tdTotal);
          // Botón eliminar
          const tdDelete = document.createElement('td');
          const deleteBtn = document.createElement('i');
          deleteBtn.className = 'fas fa-trash delete-icon';
          deleteBtn.style.cursor = 'pointer';
          deleteBtn.title = 'Eliminar ingreso';
          deleteBtn.addEventListener('click', function() {
            coinIncomes.splice(idx, 1);
            localStorage.setItem('coinIncomes', JSON.stringify(coinIncomes));
            updateCoinIncomeTable();
          });
          tdDelete.appendChild(deleteBtn);
          tr.appendChild(tdDelete);
          coinIncomeBody.appendChild(tr);
        });
        coinIncomeTotal.textContent = `$${formatNumberWithDots(total)}`;
      }
      updateCoinIncomeTable();
      // Mantener sincronizado el gráfico de ingresos
      window.coinIncomes = JSON.parse(localStorage.getItem('coinIncomes')) || [];
      window.addEventListener('storage', function() {
        window.coinIncomes = JSON.parse(localStorage.getItem('coinIncomes')) || [];
        if (window.incomeBarChart) {
          const ctx = document.getElementById('incomeBarChart').getContext('2d');
          const data = processIncomeData();
          window.incomeBarChart.data.labels = data.labels;
          window.incomeBarChart.data.datasets[0].data = data.data;
          window.incomeBarChart.data.datasets[0].backgroundColor = data.colors;
          window.incomeBarChart.data.datasets[0].borderColor = data.borderColors;
          window.incomeBarChart.update();
        }
      });
      // --- Agregar gasto ---
      const expenseForm = document.getElementById('expenseForm');
      expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Get form values
        const date = document.getElementById('expenseDate').value;
        const category = document.getElementById('expenseCategory').value;
        const description = document.getElementById('expenseDescription').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        
        // Validate form
        let isValid = true;
        
        if (!date) {
          document.getElementById('expenseDate').classList.add('is-invalid');
          isValid = false;
        } else {
          document.getElementById('expenseDate').classList.remove('is-invalid');
        }
        
        if (!category) {
          document.getElementById('expenseCategory').classList.add('is-invalid');
          isValid = false;
        } else {
          document.getElementById('expenseCategory').classList.remove('is-invalid');
        }
        
        if (!description) {
          document.getElementById('expenseDescription').classList.add('is-invalid');
          isValid = false;
        } else {
          document.getElementById('expenseDescription').classList.remove('is-invalid');
        }
        
        if (isNaN(amount) || amount <= 0) {
          document.getElementById('expenseAmount').classList.add('is-invalid');
          isValid = false;
        } else {
          document.getElementById('expenseAmount').classList.remove('is-invalid');
        }
        
        if (isValid) {
          // Add new expense
          const newExpense = {
            id: Date.now(),
            date,
            category,
            description,
            amount
          };
          expenses.push(newExpense);
          window.expenses = expenses;
          localStorage.setItem('expenses', JSON.stringify(expenses));
          updateExpensesTable();
          updateCharts();
          updateTotalExpenses();
          expenseForm.reset();
          flatpickr("#expenseDate").setDate(new Date());
          // Mostrar mensaje de éxito mejorado (toast)
          const toastEl = document.getElementById('successToast');
          const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
          toast.show();
        }
      });
      
      // Tarjeta de importar imagen
      const importImageFile = document.getElementById('importImageFile');
      const importedImagePreview = document.getElementById('importedImagePreview');
      const importedImage = document.getElementById('importedImage');
      const importImageStatus = document.getElementById('importImageStatus');

      function showImportedImage() {
        const imgData = localStorage.getItem('importedTableImage');
        if (imgData) {
          importedImage.src = imgData;
          importedImagePreview.style.display = '';
        } else {
          importedImagePreview.style.display = 'none';
        }
      }
      showImportedImage();

      if (importImageFile) {
        importImageFile.addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (!file) return;
          if (!file.type.startsWith('image/')) {
            importImageStatus.innerHTML = '<span class="badge bg-danger">El archivo no es una imagen válida.</span>';
            return;
          }
          const reader = new FileReader();
          reader.onload = function(evt) {
            localStorage.setItem('importedTableImage', evt.target.result);
            importedImage.src = evt.target.result;
            importedImagePreview.style.display = '';
            importImageStatus.innerHTML = '<span class="badge bg-success">Imagen importada correctamente.</span>';
          };
          reader.readAsDataURL(file);
        });
      }
      
      // Imprimir ingresos en monedas
      document.getElementById('printCoinIncomeBtn').addEventListener('click', function() {
        let html = `<h2 style='text-align:center;'>Ingresos en monedas</h2>`;
        html += `<table border='1' cellspacing='0' cellpadding='5' style='width:100%;margin:20px 0;text-align:center;'>`;
        html += `<tr><th>Moneda</th><th>Cantidad</th><th>Valor por moneda</th><th>Total</th></tr>`;
        const coinLabels = { '1000': '$1.000', '500': '$500', '200': '$200', '100': '$100', '50': '$50' };
        let total = 0;
        coinIncomes.forEach(c => {
          const value = parseInt(c.type);
          const subtotal = value * c.quantity;
          total += subtotal;
          html += `<tr><td>${escapeHTML(coinLabels[c.type])}</td><td>${escapeHTML(c.quantity)}</td><td>${escapeHTML(coinLabels[c.type])}</td><td>$${escapeHTML(formatNumberWithDots(subtotal))}</td></tr>`;
        });
        html += `<tr><th colspan='3' style='text-align:right;'>Total general:</th><th>$${escapeHTML(formatNumberWithDots(total))}</th></tr>`;
        html += `</table>`;
        const win = window.open('', '', 'width=900,height=700');
        win.document.write(`<html><head><title>Ingresos en monedas</title></head><body>${html}</body></html>`);
        win.document.close();
        win.print();
      });

      // Imprimir gastos
      document.getElementById('printExpensesBtn').addEventListener('click', function() {
        let html = `<h2 style='text-align:center;'>Gastos</h2>`;
        html += `<table border='1' cellspacing='0' cellpadding='5' style='width:100%;margin:20px 0;text-align:center;'>`;
        html += `<tr><th><i class="fa-solid fa-calendar"></i> Fecha</th><th>Categoría</th><th>Descripción</th><th>Monto</th></tr>`;
        let total = 0;
        expenses.forEach(e => {
          html += `<tr><td>${escapeHTML(e.date)}</td><td>${escapeHTML(e.category)}</td><td>${escapeHTML(e.description)}</td><td>$${escapeHTML(formatNumberWithDots(e.amount))}</td></tr>`;
          total += e.amount;
        });
        html += `<tr><th colspan='3' style='text-align:right;'>Total general:</th><th>$${escapeHTML(formatNumberWithDots(total))}</th></tr>`;
        html += `</table>`;
        const win = window.open('', '', 'width=900,height=700');
        win.document.write(`<html><head><title>Gastos</title></head><body>${html}</body></html>`);
        win.document.close();
        win.print();
      });

      // Guardar tabla de gastos como imagen
      document.getElementById('saveTableImageBtn').addEventListener('click', function() {
        const table = document.getElementById('expensesTable');
        if (!table) {
          alert('No se encontró la tabla de gastos.');
          return;
        }
        html2canvas(table).then(canvas => {
          const link = document.createElement('a');
          link.download = 'tabla_gastos.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        });
      });

      // Guardar tabla de monedas como imagen
      document.getElementById('saveCoinTableImageBtn').addEventListener('click', function() {
        const table = document.getElementById('coinIncomeTable');
        if (!table) {
          alert('No se encontró la tabla de monedas.');
          return;
        }
        html2canvas(table).then(canvas => {
          const link = document.createElement('a');
          link.download = 'tabla_monedas.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        });
      });
      
      // Function to format numbers with dot as thousands separator
      function formatNumberWithDots(number) {
        // Convierte a string con separador de miles punto y decimales coma
        if (typeof number !== 'number') number = parseFloat(number);
        if (isNaN(number)) return '';
        return number.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      
      // Estado de paginación
      let currentPage = 1;
      const rowsPerPage = 5;

      // Function to update expenses table
      function updateExpensesTable() {
        // Aplicar filtros actuales y paginar
        const dateValue = dateFilter.value.toLowerCase();
        const categoryValue = categoryFilter.value.toLowerCase();
        const descriptionValue = descriptionFilter.value.toLowerCase();
        const amountValue = amountFilter.value.toLowerCase();
        const filtered = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).filter(expense => {
          const dateMatch = expense.date.toLowerCase().includes(dateValue);
          const categoryMatch = (expense.category || '').toLowerCase().includes(categoryValue);
          const descriptionMatch = (expense.description || '').toLowerCase().includes(descriptionValue);
          const amountMatch = String(expense.amount).toLowerCase().includes(amountValue);
          return dateMatch && categoryMatch && descriptionMatch && amountMatch;
        });
        updateExpensesTableFiltered(filtered, currentPage);
      }

      // --- Actualizar tabla de gastos ---
    function updateExpensesTable() {
      // Usar la variable global expenses
      const dateValue = dateFilter.value.toLowerCase();
      const categoryValue = categoryFilter.value.toLowerCase();
      const descriptionValue = descriptionFilter.value.toLowerCase();
      const amountValue = amountFilter.value.toLowerCase();
      const filtered = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).filter(expense => {
        const dateMatch = expense.date.toLowerCase().includes(dateValue);
        const categoryMatch = (expense.category || '').toLowerCase().includes(categoryValue);
        const descriptionMatch = (expense.description || '').toLowerCase().includes(descriptionValue);
        const amountMatch = String(expense.amount).toLowerCase().includes(amountValue);
        return dateMatch && categoryMatch && descriptionMatch && amountMatch;
      });
      updateExpensesTableFiltered(filtered, currentPage);
    }

    // --- Actualizar totales ---
    function updateTotalExpenses() {
      const totalElement = document.getElementById('totalExpenses');
      const totalYearElement = document.getElementById('totalYear');
      const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const currentYear = new Date().getFullYear();
      const totalYear = expenses.reduce((sum, expense) => {
        const expenseYear = new Date(expense.date).getFullYear();
        return sum + (expenseYear === currentYear ? Number(expense.amount) : 0);
      }, 0);
      totalElement.textContent = `$${formatNumberWithDots(total)}`;
      totalYearElement.textContent = `$${formatNumberWithDots(totalYear)}`;
    }

    // --- Actualizar gráfica de categorías ---
    function updateCharts() {
      // Show loaders
      document.getElementById('monthlyChartLoader').style.display = "";
      document.getElementById('timelineChartLoader').style.display = '';
      setTimeout(() => {
        document.getElementById('monthlyChartLoader').style.display = 'none';
        document.getElementById('timelineChartLoader').style.display = 'none';
        const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        const timelineCtx = document.getElementById('timelineChart').getContext('2d');
        if (window.monthlyChart && typeof window.monthlyChart.destroy === 'function') window.monthlyChart.destroy();
        if (window.categoryChart && typeof window.categoryChart.destroy === 'function') window.categoryChart.destroy();
        if (window.timelineChart && typeof window.timelineChart.destroy === 'function') window.timelineChart.destroy();
        const monthlyData = processMonthlyData();
        const categoryData = processCategoryData();
        const timelineData = processTimelineData();
        window.monthlyChart = new Chart(monthlyCtx, {
          type: 'bar',
          data: {
            labels: monthlyData.labels,
            datasets: [{
              label: 'Gasto mensual',
              data: monthlyData.data,
              backgroundColor: monthlyData.colors,
              borderColor: monthlyData.borderColors,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            locale: 'es-ES',
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Monto ($)',
                  color: '#666',
                  font: { family: 'inherit', size: 14, weight: 'bold' }
                },
                ticks: {
                  callback: function(value) {
                    return '$' + formatNumberWithDots(value);
                  }
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Mes',
                  color: '#666',
                  font: { family: 'inherit', size: 14, weight: 'bold' }
                }
              }
            },
            plugins: {
              legend: {
                display: false,
                labels: { color: '#666', font: { family: 'inherit', size: 13 } }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return 'Gasto: $' + formatNumberWithDots(context.raw);
                  }
                },
                titleColor: '#333',
                bodyColor: '#333',
                footerColor: '#333'
              },
                title: {
                  display: false
                }
              }
            } // <-- Cierra el objeto options
          } // <-- Cierra el objeto pasado a new Chart
        ); // <-- Cierra la llamada a new Chart
        window.timelineChart = new Chart(timelineCtx, {
          type: 'line',
          data: {
            labels: timelineData.labels,
            datasets: [{
              label: 'Gasto acumulado',
              data: timelineData.data,
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
              borderColor: 'rgba(244, 67, 54, 1)',
              borderWidth: 2,
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            locale: 'es-ES',
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Monto acumulado ($)',
                  color: '#666',
                  font: { family: 'inherit', size: 14, weight: 'bold' }
                },
                ticks: {
                  callback: function(value) {
                    return '$' + formatNumberWithDots(value);
                  }
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Fecha',
                  color: '#666',
                  font: { family: 'inherit', size: 14, weight: 'bold' }
                }
              }
            },
            plugins: {
              legend: {
                display: false,
                labels: { color: '#666', font: { family: 'inherit', size: 13 } }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return 'Acumulado: $' + formatNumberWithDots(context.raw);
                  }
                },
                titleColor: '#333',
                bodyColor: '#333',
                footerColor: '#333'
              },
                title: {
                  display: false
                }
              }
            }
          });
        }, 500);
      }
      
      // Function to process monthly data for chart
      function processMonthlyData() {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const monthlyTotals = Array(12).fill(0);
        
        // Get current year
        const currentYear = new Date().getFullYear();
        
        // Calculate monthly totals for current year
        expenses.forEach(expense => {
          const expenseDate = new Date(expense.date);
          if (expenseDate.getFullYear() === currentYear) {
            const month = expenseDate.getMonth();
            monthlyTotals[month] += expense.amount;
          }
        });
        
        // Generate colors
        const colors = monthlyTotals.map(amount => `rgba(244, 67, 54, ${Math.min(0.3 + amount / 1000, 0.9)})`);
        const borderColors = colors.map(color => color.replace('rgba', 'rgb').replace(/[\d.]+\)$/, '1)'));
        
        return {
          labels: months,
          data: monthlyTotals,
          colors,
          borderColors
        };
      }
      
      // Function to process category data for chart
      window.processCategoryData = function processCategoryData() {
        const categoryTotals = {};
        // Mapeo de categorías en español a clave interna
        const categoryKeyMap = {
          'Alimentación': 'Food',
          'Transporte': 'Transportation',
          'Vivienda': 'Housing',
          'Servicios': 'Utilities',
          'Entretenimiento': 'Entertainment',
          'Compras': 'Shopping',
          'Salud': 'Healthcare',
          'Viajes': 'Travel',
          'Educación': 'Education',
          'Otro': 'Other',
          // También permitir claves internas para compatibilidad
          'Food': 'Food',
          'Transportation': 'Transportation',
          'Housing': 'Housing',
          'Utilities': 'Utilities',
          'Entertainment': 'Entertainment',
          'Shopping': 'Shopping',
          'Healthcare': 'Healthcare',
          'Travel': 'Travel',
          'Education': 'Education',
          'Other': 'Other'
        };
        const colorMap = {
          'Food': 'rgba(244, 67, 54, 0.7)',
          'Transportation': 'rgba(33, 150, 243, 0.7)',
          'Housing': 'rgba(76, 175, 80, 0.7)',
          'Utilities': 'rgba(255, 193, 7, 0.7)',
          'Entertainment': 'rgba(156, 39, 176, 0.7)',
          'Shopping': 'rgba(0, 188, 212, 0.7)',
          'Healthcare': 'rgba(233, 30, 99, 0.7)',
          'Travel': 'rgba(255, 87, 34, 0.7)',
          'Education': 'rgba(63, 81, 181, 0.7)',
          'Other': 'rgba(158, 158, 158, 0.7)'
        };
        const categoryLabelMap = {
          'Food': 'Alimentación',
          'Transportation': 'Transporte',
          'Housing': 'Vivienda',
          'Utilities': 'Servicios',
          'Entertainment': 'Entretenimiento',
          'Shopping': 'Compras',
          'Healthcare': 'Salud',
          'Travel': 'Viajes',
          'Education': 'Educación',
          'Other': 'Otro'
        };
        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        // Sumar todas las categorías iguales (en español o inglés)
        expenses.forEach(expense => {
          const expenseDate = new Date(expense.date);
          let key = categoryKeyMap[expense.category] || expense.category;
          if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
            if (!categoryTotals[key]) {
              categoryTotals[key] = 0;
            }
            categoryTotals[key] += expense.amount;
          }
        });
        // Agrupar por etiqueta en español para sumar correctamente si hay duplicados
        const labelTotals = {};
        Object.keys(categoryTotals).forEach(key => {
          const label = categoryLabelMap[key] || key;
          if (!labelTotals[label]) labelTotals[label] = 0;
          labelTotals[label] += categoryTotals[key];
        });
        const labels = Object.keys(labelTotals);
        const data = Object.values(labelTotals);
        const colors = labels.map(label => {
          // Buscar la key original para el color
          const key = Object.keys(categoryLabelMap).find(k => categoryLabelMap[k] === label) || 'Other';
          return colorMap[key] || 'rgba(158, 158, 158, 0.7)';
        });
        const borderColors = colors.map(color => color.replace('rgba', 'rgb').replace(/\d+\.\d+\)$/, '1)'));
        return {
          labels,
          data,
          colors,
          borderColors
        };
      }
      
      // Function to process timeline data for chart
      function processTimelineData() {
        // Sort expenses by date
        const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Group by date
        const dailyTotals = {};
        
        sortedExpenses.forEach(expense => {
          if (!dailyTotals[expense.date]) {
            dailyTotals[expense.date] = 0;
          }
          dailyTotals[expense.date] += expense.amount;
        });
        
        // Convert to cumulative totals
        let cumulativeTotal = 0;
        const cumulativeTotals = {};
        
        Object.keys(dailyTotals).sort().forEach(date => {
          cumulativeTotal += dailyTotals[date];
          cumulativeTotals[date] = cumulativeTotal;
        });
        
        // Get dates and cumulative totals
        const labels = Object.keys(cumulativeTotals);
        const data = Object.values(cumulativeTotals);
        
        return {
          labels,
          data
        };
      }
      
           
      // Initialize table filters
      const dateFilter = document.getElementById('dateFilter');
      const categoryFilter = document.getElementById('categoryFilter');
      const descriptionFilter = document.getElementById('descriptionFilter');
      const amountFilter = document.getElementById('amountFilter');
      
      // Add filter event listeners
      // dateFilter uses flatpickr which triggers change; use change for consistency
      dateFilter.addEventListener('change', filterTable);
      // categoryFilter is a select -> listen for change
      categoryFilter.addEventListener('change', filterTable);
      descriptionFilter.addEventListener('input', filterTable);
      amountFilter.addEventListener('input', filterTable);

      // Populate categoryFilter options from the main expenseCategory select
      const expenseCategory = document.getElementById('expenseCategory');
      if (expenseCategory && categoryFilter) {
        // Ensure a default "Todas" option remains first
        if (categoryFilter.options.length <= 1) {
          Array.from(expenseCategory.options).forEach(opt => {
            if (!opt.value) return; // skip placeholder
            if (![...categoryFilter.options].some(o => o.value === opt.value)) {
              const newOpt = document.createElement('option');
              newOpt.value = opt.value;
              newOpt.text = opt.text;
              categoryFilter.appendChild(newOpt);
            }
          });
        }

        // Keep in sync if categories change in the form
        expenseCategory.addEventListener('change', () => {
          const prev = categoryFilter.value;
          categoryFilter.innerHTML = '<option value="">Todas</option>';
          Array.from(expenseCategory.options).forEach(opt => {
            if (!opt.value) return;
            const newOpt = document.createElement('option');
            newOpt.value = opt.value;
            newOpt.text = opt.text;
            categoryFilter.appendChild(newOpt);
          });
          // restore previous selection if still available
          categoryFilter.value = prev || '';
          filterTable();
        });
      }
      
      function filterTable() {
        const dateValue = dateFilter.value.toLowerCase();
        const categoryValue = categoryFilter.value.toLowerCase();
        const descriptionValue = descriptionFilter.value.toLowerCase();
        const amountValue = amountFilter.value.toLowerCase();

        // Filtrar gastos y paginar
        const filtered = [...expenses].filter(expense => {
          const dateMatch = expense.date.toLowerCase().includes(dateValue);
          const categoryMatch = (expense.category || '').toLowerCase().includes(categoryValue);
          const descriptionMatch = (expense.description || '').toLowerCase().includes(descriptionValue);
          const amountMatch = String(expense.amount).toLowerCase().includes(amountValue);
          return dateMatch && categoryMatch && descriptionMatch && amountMatch;
        });
        // Actualizar tabla con los filtrados y reiniciar a la página 1
        updateExpensesTableFiltered(filtered, 1);
      }

      function updateExpensesTableFiltered(filteredExpenses, page = 1) {
        const tableBody = document.getElementById('expensesTableBody');
        const currentRowsElement = document.getElementById('currentRows');
        const totalRowsElement = document.getElementById('totalRows');
        const paginationElement = document.getElementById('tablePagination');
        tableBody.innerHTML = '';
        const totalRows = filteredExpenses.length;
        const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
        if (page > totalPages) page = totalPages;
        currentPage = page;
        const startIdx = (currentPage - 1) * rowsPerPage;
        const endIdx = startIdx + rowsPerPage;
        const expensesToShow = filteredExpenses.slice(startIdx, endIdx);

        expensesToShow.forEach(expense => {
          const tr = document.createElement('tr');
          // Fecha
          const dateCell = document.createElement('td');
          dateCell.className = 'editable-cell';
          dateCell.dataset.id = expense.id;
          dateCell.dataset.field = 'date';
          dateCell.textContent = expense.date;
          dateCell.addEventListener('click', function() {
            makeExpenseCellEditable(this, expense, 'date');
          });
          tr.appendChild(dateCell);
          // Categoría (en español)
          const categoryCell = document.createElement('td');
          categoryCell.className = 'editable-cell';
          categoryCell.dataset.id = expense.id;
          categoryCell.dataset.field = 'category';
          const categoryMap = {
            'Food': 'Alimentación',
            'Transportation': 'Transporte',
            'Housing': 'Vivienda',
            'Utilities': 'Servicios',
            'Entertainment': 'Entretenimiento',
            'Shopping': 'Compras',
            'Healthcare': 'Salud',
            'Travel': 'Viajes',
            'Education': 'Educación',
            'Other': 'Otro'
          };
          categoryCell.textContent = categoryMap[expense.category] || expense.category;
          categoryCell.addEventListener('click', function() {
            makeExpenseCellEditable(this, expense, 'category');
          });
          tr.appendChild(categoryCell);
          // Descripción
          const descriptionCell = document.createElement('td');
          descriptionCell.className = 'editable-cell';
          descriptionCell.dataset.id = expense.id;
          descriptionCell.dataset.field = 'description';
          descriptionCell.textContent = expense.description;
          descriptionCell.addEventListener('click', function() {
            makeExpenseCellEditable(this, expense, 'description');
          });
          tr.appendChild(descriptionCell);
          // Monto
          const amountCell = document.createElement('td');
          amountCell.className = 'editable-cell text-end';
          amountCell.dataset.id = expense.id;
          amountCell.dataset.field = 'amount';
          amountCell.textContent = `$${formatNumberWithDots(expense.amount)}`;
          amountCell.addEventListener('click', function() {
            makeExpenseCellEditable(this, expense, 'amount');
          });
          tr.appendChild(amountCell);
          // Acciones
          const actionsCell = document.createElement('td');
          actionsCell.className = 'text-center';
          const deleteIcon = document.createElement('i');
          deleteIcon.className = 'fas fa-trash delete-icon';
          deleteIcon.dataset.id = expense.id;
          deleteIcon.title = 'Eliminar';
          deleteIcon.addEventListener('click', function() {
            const id = this.dataset.id;
            expenses = expenses.filter(exp => exp.id != id);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            filterTable(); // Refiltrar y repaginar
            updateCharts();
            updateTotalExpenses();
          });
          actionsCell.appendChild(deleteIcon);
          tr.appendChild(actionsCell);
          tableBody.appendChild(tr);
        });
        currentRowsElement.textContent = expensesToShow.length;
        totalRowsElement.textContent = totalRows;
        // --- Controles de paginación ---
        if (paginationElement) {
          paginationElement.innerHTML = '';
          // Prev
          const prevLi = document.createElement('li');
          prevLi.className = `page-item${currentPage === 1 ? ' disabled' : ''}`;
          const prevBtn = document.createElement('button');
          prevBtn.className = 'page-link';
          prevBtn.innerHTML = '&laquo;';
          prevBtn.onclick = () => {
            if (currentPage > 1) updateExpensesTableFiltered(filteredExpenses, currentPage - 1);
          };
          prevLi.appendChild(prevBtn);
          paginationElement.appendChild(prevLi);
          // Números
          for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item${i === currentPage ? ' active' : ''}`;
            const btn = document.createElement('button');
            btn.className = 'page-link';
            btn.textContent = i;
            btn.onclick = () => updateExpensesTableFiltered(filteredExpenses, i);
            li.appendChild(btn);
            paginationElement.appendChild(li);
          }
          // Next
          const nextLi = document.createElement('li');
          nextLi.className = `page-item${currentPage === totalPages ? ' disabled' : ''}`;
          const nextBtn = document.createElement('button');
          nextBtn.className = 'page-link';
          nextBtn.innerHTML = '&raquo;';
          nextBtn.onclick = () => {
            if (currentPage < totalPages) updateExpensesTableFiltered(filteredExpenses, currentPage + 1);
          };
          nextLi.appendChild(nextBtn);
          paginationElement.appendChild(nextLi);
        }
      }

      // Inicializa tabla filtrada al cargar la página
      // window.addEventListener('DOMContentLoaded', () => filterTable());
      
      // Initialize the UI
      updateExpensesTable();
      updateCharts();
      updateTotalExpenses();

      // Inicializa el gráfico de ingresos (barra)
      const incomeBarCanvas = document.getElementById('incomeBarChart');
      if (incomeBarCanvas) {
        if (window.incomeBarChart && typeof window.incomeBarChart.destroy === 'function') window.incomeBarChart.destroy();
        const incomeBarCtx = incomeBarCanvas.getContext('2d');
        let incomeData = processIncomeData();
        console.log('[BarChart] Datos ingresos:', incomeData);
        if (!incomeData.labels.length) {
          console.warn('Sin datos para la gráfica de ingresos. Mostrando ejemplo.');
          incomeData = {
            labels: ['Ejemplo 1', 'Ejemplo 2'],
            data: [60, 40],
            colors: ['#4caf50', '#f44336'],
            borderColors: ['#388e3c', '#b71c1c']
          };
        }
        window.incomeBarChart = new Chart(incomeBarCtx, {
          type: 'bar',
          data: {
            labels: incomeData.labels,
            datasets: [{
              label: 'Ingresos',
              data: incomeData.data,
              backgroundColor: incomeData.colors,
              borderColor: incomeData.borderColors,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.label}: $${context.raw.toLocaleString('es-CO')}`;
                  }
                }
              },
              title: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Monto ($)',
                  color: '#666',
                  font: { family: 'inherit', size: 14, weight: 'bold' }
                },
                ticks: {
                  callback: function(value) {
                    return '$' + value.toLocaleString('es-CO');
                  }
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Tipo de ingreso',
                  color: '#666',
                  font: { family: 'inherit', size: 14, weight: 'bold' }
                }
              }
            }
          }
        });
      } else {
        console.error('No existe el canvas de ingresos (incomeBarChart)');
      }

      // Inicializa el gráfico de categorías (pie)
      const categoryPieCanvas = document.getElementById('categoryChart');
      if (categoryPieCanvas) {
        // Elimina el loader antes de crear la gráfica para evitar parpadeos o demoras visuales
        const loader = document.getElementById('categoryChartLoader');
        if (loader) loader.classList.add('d-none');
        if (window.categoryPieChart && typeof window.categoryPieChart.destroy === 'function') window.categoryPieChart.destroy();
        const categoryPieCtx = categoryPieCanvas.getContext('2d');
        let categoryData = processCategoryData();
        console.log('[PieChart] Datos categorías:', categoryData);
        if (!categoryData.labels.length) {
          console.warn('Sin datos para la gráfica de categorías. Mostrando ejemplo.');
          categoryData = {
            labels: ['Ejemplo A', 'Ejemplo B', 'Ejemplo C'],
            data: [30, 50, 20],
            colors: ['#2196f3', '#ff9800', '#9c27b0'],
            borderColors: ['#1565c0', '#e65100', '#4a148c']
          };
        }
        window.categoryPieChart = new Chart(categoryPieCtx, {
          type: 'pie',
          data: {
            labels: categoryData.labels,
            datasets: [{
              data: categoryData.data,
              backgroundColor: categoryData.colors,
              borderColor: categoryData.borderColors,
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#666', font: { family: 'inherit', size: 13 } } },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: $${value.toLocaleString('es-CO')} (${percentage}%)`;
                  }
                }
              },
              title: {
                display: false
              }
            }
          }
        });
      } else {
        console.error('No existe el canvas de categorías (categoryChart)');
      }


      // Recarga los dashboards al mostrar la pestaña Dashboard
      document.getElementById('dashboard-tab').addEventListener('shown.bs.tab', function () {
        updateCharts();
        // Refresca el gráfico de ingresos (barra)
        const incomeBarCanvas = document.getElementById('incomeBarChart');
        if (incomeBarCanvas) {
          if (window.incomeBarChart) window.incomeBarChart.destroy();
          const ctx = incomeBarCanvas.getContext('2d');
          const data = processIncomeData();
          window.incomeBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: data.labels,
              datasets: [{
                label: 'Ingresos',
                data: data.data,
                backgroundColor: data.colors,
                borderColor: data.borderColors,
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${context.label}: $${context.raw.toLocaleString('es-CO')}`;
                    }
                  }
                },
                title: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Monto ($)',
                    color: '#666',
                    font: { family: 'inherit', size: 14, weight: 'bold' }
                  },
                  ticks: {
                    callback: function(value) {
                      return '$' + value.toLocaleString('es-CO');
                    }
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Tipo de ingreso',
                    color: '#666',
                    font: { family: 'inherit', size: 14, weight: 'bold' }
                  }
                }
              }
            }
          });
        }
        // Refresca el gráfico de categorías (pie)
        const categoryPieCanvas = document.getElementById('categoryChart');
        if (categoryPieCanvas) {
          if (window.categoryPieChart) window.categoryPieChart.destroy();
          const ctx = categoryPieCanvas.getContext('2d');
          const data = processCategoryData();
          window.categoryPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: data.labels,
              datasets: [{
                data: data.data,
                backgroundColor: data.colors,
                borderColor: data.borderColors,
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { position: 'bottom', labels: { color: '#666', font: { family: 'inherit', size: 13 } } },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.raw;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percentage = Math.round((value / total) * 100);
                      return `${label}: $${value.toLocaleString('es-CO')} (${percentage}%)`;
                    }
                  }
                },
                title: {
                  display: false
                }
              }
            }
          });
        }
      });
    });
    
    function initCharts() {
      // Monthly expenses bar chart
      const monthlyCtx = document.getElementById('monthlyExpensesChart').getContext('2d');
      window.monthlyChart = new Chart(monthlyCtx, {
        type: 'bar',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
          datasets: [{
            label: 'Gastos Mensuales',
            data: [12000, 19000, 15000, 26700, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#FF0000',
            borderColor: '#CC0000',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString('es-AR');
                }
              }
            }
          }
        }
      });
      // Category pie chart
      const pieCtx = document.getElementById('categoryPieChart').getContext('2d');
      window.pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Alimentación', 'Transporte', 'Vivienda', 'Entretenimiento', 'Salud'],
          datasets: [{
            data: [5000, 2500, 15000, 1200, 3000],
            backgroundColor: [
              '#FF0000',
              '#FF3333',
              '#FF6666',
              '#FF9999',
              '#FFCCCC'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: $${value.toLocaleString('es-AR')} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
      // Cumulative expenses line chart
      const lineCtx = document.getElementById('cumulativeExpensesChart').getContext('2d');
      window.lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr'],
          datasets: [{
            label: 'Gasto Acumulado',
            data: [12000, 31000, 46000, 72700],
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            borderColor: '#FF0000',
            borderWidth: 2,
            fill: true,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString('es-AR');
                }
              }
            }
          }
        }
      });
    }
    
    // Llama a initCharts() cuando el DOM esté listo y los canvas existan
    document.addEventListener('DOMContentLoaded', function() {
      // ...existing code...
      if (
        document.getElementById('monthlyExpensesChart') &&
        document.getElementById('categoryPieChart') &&
        document.getElementById('cumulativeExpensesChart')
      ) {
        initCharts();
      }
      // ...existing code...
    });

  // Script: manejo de reinicio selectivo
    document.addEventListener('DOMContentLoaded', function() {
      const resetBtn = document.getElementById('resetAllBtn');
      const resetModalEl = document.getElementById('resetModal');
      if (!resetBtn || !resetModalEl) return;
      const resetModal = new bootstrap.Modal(resetModalEl);

      const chkExpenses = document.getElementById('resetExpensesChk');
      const chkCoins = document.getElementById('resetCoinsChk');
      const chkBills = document.getElementById('resetBillsChk');
      const chkAll = document.getElementById('resetSelectAll');
      const confirmBtn = document.getElementById('confirmResetBtn');

      // Mostrar modal al hacer click en el botón
      resetBtn.addEventListener('click', function() {
        // por defecto marcar todo
        if (chkExpenses) chkExpenses.checked = true;
        if (chkCoins) chkCoins.checked = true;
        if (chkBills) chkBills.checked = true;
        if (chkAll) chkAll.checked = false;
        resetModal.show();
      });

      // Seleccionar todo
      if (chkAll) {
        chkAll.addEventListener('change', function(e) {
          const v = e.target.checked;
          if (chkExpenses) chkExpenses.checked = v;
          if (chkCoins) chkCoins.checked = v;
          if (chkBills) chkBills.checked = v;
        });
      }

      // Acción de confirmación
      if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
          const resetExpenses = chkExpenses && chkExpenses.checked;
          const resetCoins = chkCoins && chkCoins.checked;
          const resetBills = chkBills && chkBills.checked;

          if (!resetExpenses && !resetCoins && !resetBills) {
            alert('Selecciona al menos una opción para reiniciar.');
            return;
          }

          // Reiniciar gastos
          if (resetExpenses) {
            try {
              expenses = [];
              localStorage.removeItem('expenses');
              window.expenses = [];
              if (typeof updateExpensesTable === 'function') updateExpensesTable();
              if (typeof updateTotalExpenses === 'function') updateTotalExpenses();
            } catch (e) { console.error(e); }
          }

          // Reiniciar monedas
          if (resetCoins) {
            try {
              coinIncomes = [];
              localStorage.removeItem('coinIncomes');
              window.coinIncomes = [];
              if (typeof updateCoinIncomeTable === 'function') updateCoinIncomeTable();
            } catch (e) { console.error(e); }
          }

          // Reiniciar billetes
          if (resetBills) {
            try {
              if (typeof window.setBillIncomes === 'function') window.setBillIncomes([]);
              localStorage.removeItem('billIncomes');
              if (typeof updateBillIncomeTable === 'function') updateBillIncomeTable();
            } catch (e) { console.error(e); }
          }

          // Actualizar gráficas si existe la función
          if (typeof updateCharts === 'function') updateCharts();

          resetModal.hide();

          // Mostrar feedback
          const successToastEl = document.getElementById('successToast');
          if (successToastEl) {
            const toast = new bootstrap.Toast(successToastEl);
            const body = successToastEl.querySelector('.toast-body');
            if (body) body.textContent = 'Datos reiniciados correctamente. Recargando...';
            toast.show();
          } else {
            alert('Datos reiniciados correctamente. Recargando...');
          }

          // Forzar recarga para asegurar que todas las variables y tablas se actualicen
          setTimeout(function() { location.reload(); }, 600);
        });
      }
    });