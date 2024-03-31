document.getElementById("billForm").addEventListener("submit", function (event) {
    event.preventDefault();
    let billNo = document.getElementById("billNo").value;
    let date = document.getElementById("date").value;
    let gstNo = document.getElementById("gstNo").value;
    let customerName = document.getElementById("customerName").value;
    let customerAddress = document.getElementById("customerAddress").value;
    let ProductDetail = document.getElementById("ProductDetail").value;
    let orderId = document.getElementById("orderId").value;
    let saleMoney = document.getElementById("saleMoney").value;
    let cgst = document.getElementById("cgst").value;
    let sgst = document.getElementById("sgst").value;
    let totalMoney = document.getElementById("totalMoney").value;
    let signature = document.getElementById("signature").value;

    addBillToTable(billNo, date, gstNo, customerName, customerAddress, ProductDetail, orderId, saleMoney, cgst, sgst, totalMoney, signature); // Pass individual parameters
    saveTableToLocal();
});


function addBillToTable(billNo, date, gstNo, customerName, customerAddress, ProductDetail, orderId, saleMoney, cgst, sgst, totalMoney, signature) {
    let billList = document.getElementById("billList");

    let newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${billNo}</td>
        <td>${date}</td>
        <td>${gstNo}</td>
        <td>${customerName}</td>
        <td>${customerAddress}</td>
        <td>${ProductDetail}</td>
        <td>${orderId}</td>
        <td>${saleMoney}</td>
        <td>${cgst}</td>
        <td>${sgst}</td>
        <td>${totalMoney}</td>
        <td>${signature}</td>
    `;
    addRowActions(newRow); // Add row actions (download, print, and delete)

    billList.appendChild(newRow);
}



// Function to save table data to local storage
function saveTableToLocal() {
    let tableData = [];
    let rows = document.querySelectorAll("#billList tr");
    rows.forEach(function (row) {
        let rowData = [];
        row.querySelectorAll("td").forEach(function (cell) {
            rowData.push(cell.textContent);
        });
        tableData.push(rowData);
    });
    localStorage.setItem("billTableData", JSON.stringify(tableData));
}

// Function to load table data from local storage
function loadTableFromLocal() {
    let tableData = JSON.parse(localStorage.getItem("billTableData"));
    if (tableData) {
        let billList = document.getElementById("billList");
        billList.innerHTML = "";
        tableData.forEach(function (rowData) {
            let newRow = document.createElement("tr");
            rowData.forEach(function (cellData) {
                let newCell = document.createElement("td");
                newCell.textContent = cellData;
                newRow.appendChild(newCell);
            });
            addRowActions(newRow); // Add row actions (download and delete)
            billList.appendChild(newRow);
        });
    }
}

// Load table data from local storage when the page loads
window.onload = function () {
    loadTableFromLocal();
};

// Add event listener to the form for saving data to local storage after submitting
document.getElementById("billForm").addEventListener("submit", function (event) {
    event.preventDefault();
    let formData = {};
    Array.from(document.querySelectorAll("#billForm input")).forEach(function (input) {
        formData[input.id] = input.value;
    });
    addBillToTable(formData);
    saveTableToLocal();
});


// Function to add actions (download, print, and delete) to a table row
function addRowActions(row) {
    let billNoCell = row.querySelector("td:nth-child(2)");
    if (!billNoCell) {
        console.error("Bill number cell not found in the row:", row);
        return;
    }
    let billNo = billNoCell.textContent;

    let downloadButton = document.createElement("button");
    downloadButton.textContent = "Download";
    downloadButton.onclick = function () {
        downloadBillText(billNo); // Pass bill number to download function
    };
    row.appendChild(downloadButton);

    let printButton = document.createElement("button");
    printButton.textContent = "Print";
    printButton.onclick = function () {
        printBill(billNo); // Pass bill number to print function
    };
    row.appendChild(printButton);

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function () {
        row.remove();
        saveTableToLocal();
    };
    row.appendChild(deleteButton);
}



function downloadBillText(billNo) {
    // Retrieve bill details from the table
    let billList = document.getElementById("billList").getElementsByTagName("tr");
    let bill;
    for (let i = 0; i < billList.length; i++) {
        if (billList[i].getElementsByTagName("td")[1].textContent === billNo) {
            bill = {
                date: billList[i].getElementsByTagName("td")[0].textContent,
                billNo: billList[i].getElementsByTagName("td")[1].textContent,
                gstNo: billList[i].getElementsByTagName("td")[2].textContent,
                customerName: billList[i].getElementsByTagName("td")[3].textContent,
                customerAddress: billList[i].getElementsByTagName("td")[4].textContent,
                ProductDetail: billList[i].getElementsByTagName("td")[5].textContent,
                orderId: billList[i].getElementsByTagName("td")[6].textContent,
                saleMoney: billList[i].getElementsByTagName("td")[7].textContent,
                cgst: billList[i].getElementsByTagName("td")[8].textContent,
                sgst: billList[i].getElementsByTagName("td")[9].textContent,
                totalMoney: billList[i].getElementsByTagName("td")[10].textContent,
                signature: billList[i].getElementsByTagName("td")[11].textContent
            };
            break;
        }
    }

    if (!bill) {
        console.error("Bill not found!");
        return;
    }

    console.log("Bill details:", bill);

    // Construct bill text content
    let billText = `
    ****************************************************************
    
        Date: ${bill.date}
        Bill No.: ${bill.billNo}
        GST No.: ${bill.gstNo}
        Customer Name: ${bill.customerName}
        Customer Address: ${bill.customerAddress}
        Product Detail: ${bill.ProductDetail}
        Order Detail: ${bill.orderId}
        Sale Money: ${bill.saleMoney}
        CGST: ${bill.cgst}
        SGST: ${bill.sgst}
        Total Money: ${bill.totalMoney}
        Signature: ${bill.signature}

    ****************************************************************
    `;

    console.log("Bill text content:", billText);

    // Create a Blob object containing the bill text content
    let blob = new Blob([billText], { type: "text/plain;charset=utf-8" });

    // Create a temporary anchor element and set its attributes
    let anchor = document.createElement("a");
    anchor.href = window.URL.createObjectURL(blob);
    anchor.download = `${bill.billNo}_bill.txt`;

    // Trigger a click event on the anchor element to initiate the download
    anchor.click();
}

// Function to download all bills with user-specified filename
document.getElementById("downloadAllBtn").addEventListener("click", function () {
    // Prompt the user to enter the filename
    let fileName = prompt("Enter filename", "all_bills.csv");
    if (!fileName) return; // If user cancels or leaves the filename empty, exit

    // Retrieve all bill rows from the table
    let billRows = document.querySelectorAll("#billList tr");

    // Initialize CSV content with headers
    let csvContent = "Bill No.,Date,GST No.,Customer Name,Customer Address,Product Detail,Order Detail,Sale Money,CGST,SGST,Total Money,Signature\n";

    // Iterate through each bill row and append bill details to CSV content
    billRows.forEach(function (row) {
        let bill = {
            billNo: row.children[0].textContent,
            Date: row.children[1].textContent,
            gstNo: row.children[2].textContent,
            customerName: row.children[3].textContent,
            customerAddress: row.children[4].textContent,
            ProductDetail: row.children[5].textContent,
            orderId: row.children[6].textContent,
            saleMoney: row.children[7].textContent,
            cgst: row.children[8].textContent,
            sgst: row.children[9].textContent,
            totalMoney: row.children[10].textContent,
            signature: row.children[11].textContent
        };

        // Append bill details to CSV content
        csvContent += `${bill.billNo},${bill.Date},${bill.gstNo},"${bill.customerName}","${bill.customerAddress}","${bill.ProductDetail}","${bill.orderId}",${bill.saleMoney},${bill.cgst},${bill.sgst},${bill.totalMoney},"${bill.signature}"\n`;
    });

    // Create a Blob object containing the CSV content
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });

    // Create a temporary anchor element and set its attributes
    let anchor = document.createElement("a");
    anchor.href = window.URL.createObjectURL(blob);
    anchor.download = fileName;

    // Trigger a click event on the anchor element to initiate the download
    anchor.click();
});

// Function to print a particular bill in textual format
function printBill(billNo) {
    // Retrieve bill details from the table
    let billList = document.getElementById("billList").getElementsByTagName("tr");
    let bill;
    for (let i = 0; i < billList.length; i++) {
        if (billList[i].getElementsByTagName("td")[1].textContent === billNo) {
            bill = {
                date: billList[i].getElementsByTagName("td")[0].textContent,
                billNo: billList[i].getElementsByTagName("td")[1].textContent,
                gstNo: billList[i].getElementsByTagName("td")[2].textContent,
                customerName: billList[i].getElementsByTagName("td")[3].textContent,
                customerAddress: billList[i].getElementsByTagName("td")[4].textContent,
                ProductDetail: billList[i].getElementsByTagName("td")[5].textContent,
                orderId: billList[i].getElementsByTagName("td")[6].textContent,
                saleMoney: billList[i].getElementsByTagName("td")[7].textContent,
                cgst: billList[i].getElementsByTagName("td")[8].textContent,
                sgst: billList[i].getElementsByTagName("td")[9].textContent,
                totalMoney: billList[i].getElementsByTagName("td")[10].textContent,
                signature: billList[i].getElementsByTagName("td")[11].textContent
            };
            break;
        }
    }

    if (!bill) {
        alert("Bill not found!");
        return;
    }

    // Construct printable text
    let printableText = `
    ****************************************************************

        Date: ${bill.date}
        BILL No.: ${bill.billNo}
        GST No.: ${bill.gstNo}
        Customer Name: ${bill.customerName}
        Customer Address: ${bill.customerAddress}
        Product Detail: ${bill.ProductDetail}
        Order Detail: ${bill.orderId}
        Amount: ${bill.saleMoney}
        CGST: ${bill.cgst}
        SGST: ${bill.sgst}
        Total Money: ${bill.totalMoney}
        Signature: ${bill.signature}

    ****************************************************************
    `;

    // Open a new window for printing
    let printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>Print Bill</title></head><body>");
    printWindow.document.write("<pre>" + printableText + "</pre>");
    printWindow.document.write("</body></html>");

    // Print the window
    printWindow.print();
}




