export enum UserState {
	INVITED = "INVITED",
	ACTIVE = "ACTIVE",
	DISABLED = "DISABLED",
}

export enum Gender {
	MALE = "MALE",
	FEMALE = "FEMALE",
	NOT_SPECIFIED = "NOT_SPECIFIED",
}

export enum ServiceType {
	VISIT = "VISIT",
	LAB = "LAB",
	INSTRUMENTAL = "INSTRUMENTAL",
}

export enum BookingState {
	BOOKED = "BOOKED",
	CANCELLED = "CANCELLED",
	COMPLETED = "COMPLETED",
}

export enum UserKind {
	ADMIN = "ADMIN",
	DOCTOR = "DOCTOR",
	DOCTOR_ASSISTANT = "DOCTOR_ASSISTANT",
	PATIENT = "PATIENT",
	CLINIC_MANAGER = "CLINIC_MANAGER",
}
