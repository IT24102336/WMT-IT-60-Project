const toIdString = (value) => (value ? String(value) : value);

const serializeHospital = (hospital) => ({
  id: toIdString(hospital._id),
  name: hospital.name,
  province: hospital.province,
  district: hospital.district,
  address: hospital.address,
  contactNumber: hospital.contactNumber,
  image: hospital.image,
  createdBy: toIdString(hospital.createdBy),
  createdAt: hospital.createdAt,
  updatedAt: hospital.updatedAt
});

const serializeCamp = (camp) => ({
  id: toIdString(camp._id),
  name: camp.name,
  province: camp.province,
  district: camp.district,
  nearestHospital: camp.nearestHospital,
  location: camp.location,
  address: camp.address,
  googleMapLink: camp.googleMapLink,
  date: camp.date,
  startTime: camp.startTime,
  endTime: camp.endTime,
  campStatus: camp.campStatus,
  interestCount: camp.interestedCount,
  createdAt: camp.createdAt,
  updatedAt: camp.updatedAt
});

const serializeAppointment = (appointment) => ({
  id: toIdString(appointment._id),
  donor: appointment.donor
    ? {
        id: toIdString(appointment.donor._id || appointment.donor),
        user: toIdString(appointment.donor.user)
      }
    : null,
  donorUserId: toIdString(appointment.donorUserId),
  donorName: appointment.donorName,
  hospitalId: appointment.hospitalId,
  centerType: appointment.centerType,
  centerName: appointment.centerName,
  bloodType: appointment.bloodType,
  date: appointment.date,
  status: appointment.status,
  questionnaire: appointment.questionnaire,
  createdAt: appointment.createdAt,
  updatedAt: appointment.updatedAt
});

const serializeDonor = (donor) => ({
  id: toIdString(donor._id),
  user: donor.user && typeof donor.user === "object"
    ? {
        id: toIdString(donor.user._id),
        name: donor.user.name,
        email: donor.user.email,
        role: donor.user.role
      }
    : toIdString(donor.user),
  bloodType: donor.bloodType,
  lastDonationDate: donor.lastDonationDate,
  weight: donor.weight,
  gender: donor.gender,
  dateOfBirth: donor.dateOfBirth,
  province: donor.province,
  district: donor.district,
  nearestHospital: donor.nearestHospital,
  safetyStatus: donor.safetyStatus,
  positiveReason: donor.positiveReason,
  createdAt: donor.createdAt,
  updatedAt: donor.updatedAt
});

module.exports = {
  serializeHospital,
  serializeCamp,
  serializeAppointment,
  serializeDonor
};
