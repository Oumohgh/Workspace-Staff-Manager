fetch("data.json")
.then((res) => res.json())
.then((roomData) => roomData.forEach(room => {document.querySelector(".row").innerHTML += displayRoom(room)}))

let count = 0;

document.addEventListener("DOMContentLoaded", () => {
    let employees = getEmployeesAddedToLocalStorage("employee") || [];

    employees.forEach(employee => {
        if (!employee.location) {        
            let unassignedContainer = document.querySelector(".unassigned-employees");
            if (unassignedContainer) {
                unassignedContainer.innerHTML += displayUnassignedEmployees(employee);
            }
        } else if(employee.location === "Conference Room"){     
            let room0 = document.querySelector(".room-0");
            if (room0) room0.innerHTML += displayConferenceRoomEmployees(employee);
        } else if(employee.location === "Security Room"){        
            let room3 = document.querySelector(".room-3");
            if (room3) room3.innerHTML += displaySecurityRoomEmployees(employee);
        } else if(employee.location === "Server Room"){        
            let room2 = document.querySelector(".room-2");
            if (room2) room2.innerHTML += displayServerRoomEmployees(employee);
        } else if(employee.location === "Reception"){        
            let room1 = document.querySelector(".room-1");
            if (room1) room1.innerHTML += displayReceptionRoomEmployees(employee);
        } else if(employee.location === "Staff Room"){        
            let room4 = document.querySelector(".room-4");
            if (room4) room4.innerHTML += displayStaffRoomEmployees(employee);
        } else if(employee.location === "Spare Room"){        
            let room5 = document.querySelector(".room-5");
            if (room5) room5.innerHTML += displaySpareRoomEmployees(employee);
        }
    });
});
