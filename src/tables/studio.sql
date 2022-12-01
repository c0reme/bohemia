CREATE TABLE bohemia.studio (
"studioId" bigserial NOT NULL PRIMARY KEY,
"studioName" varchar(255) NOT NULL,
"addressFK" bigint NOT NULL CONSTRAINT studio_address_addressId_fk REFERENCES bohemia.address,
"studioHead" bigint NOT NULL CONSTRAINT studio_employee_employeeId_fk REFERENCES bohemia.employee,
phone int NOT NULL,
email varchar(255) NOT NULL,
platform varchar(255) NOT NULL
);