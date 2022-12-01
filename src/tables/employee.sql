CREATE TABLE bohemia.employee (
"employeeId" bigserial NOT NULL PRIMARY KEY,
"firstName" varchar(255) NOT NULL,
"lastName" varchar(255) NOT NULL,
"addressFK" bigint NOT NULL CONSTRAINT employee_address_addressId_fk REFERENCES bohemia.address,
email varchar(255) NOT NULL,
username varchar(255) NOT NULL,
phone int NOT NULL,
"currentProject" varchar(255) NOT NULL,
"pastProjects" varchar(255) NOT NULL
);