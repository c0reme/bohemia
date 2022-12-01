CREATE TABLE bohemia."employeeContract" (
"contractId" bigserial NOT NULL PRIMARY KEY,
"employeeFK" bigint NOT NULL CONSTRAINT "employeeContract_employee_employeeId_fk" REFERENCES bohemia.employee,
"studioFK" bigint NOT NULL CONSTRAINT "employeeContract_studio_studioId_fk" REFERENCES bohemia.studio,
"startDate" date NOT NULL,
"endDate" date NULLS,
status varchar(50) NOT NULL,
"currentRole" varchar(50) NOT NULL
);