// import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Appointment } from './appointment.entity';
// import { MailService } from '../mail/mail.service';
// import { VisitorMailService } from './visitor-mail/visitor-mail.service';
// import { pagination } from '../appointment/appointment_dto/pagination.dto';

// @Injectable()
// export class AppointmentService {
//   constructor(
//     @InjectRepository(Appointment)
//     private readonly appointmentRepo: Repository<Appointment>,
//     private readonly mailService: MailService,
//     private readonly visitorMailService: VisitorMailService,
//   ) { }

//   async createOrUpdateAppointment(data: Partial<Appointment>): Promise<Appointment> {
//     try {
//       console.log('📥 Incoming appointment data:', JSON.stringify(data, null, 2));

//       if (!data.email || !data.date || !data.time) {
//         throw new BadRequestException('Missing required fields: email, date, time');
//       }

//       const existingAppointment = await this.appointmentRepo.findOne({
//         where: {
//           email: data.email,
//           date: data.date,
//           time: data.time,
//         },
//       });

//       let savedAppointment: Appointment;

//       if (existingAppointment) {
//         savedAppointment = await this.appointmentRepo.save({
//           ...existingAppointment,
//           firstname: data.firstname !== undefined ? data.firstname : existingAppointment.firstname,
//           lastname: data.lastname !== undefined ? data.lastname : existingAppointment.lastname,
//           contactnumber: data.contactnumber !== undefined ? data.contactnumber : existingAppointment.contactnumber,
//           vehiclenumber: data.vehiclenumber !== undefined ? data.vehiclenumber : existingAppointment.vehiclenumber,
//           nationalid: data.nationalid || existingAppointment.nationalid,
//           photo: data.photo || existingAppointment.photo,
//           gender: data.gender || existingAppointment.gender,
//           notes: data.notes || existingAppointment.notes,
//           visit: data.visit || existingAppointment.visit,
//           personname: data.personname || existingAppointment.personname,
//           department: data.department || existingAppointment.department,
//           durationtime: data.durationtime || existingAppointment.durationtime,
//           durationunit: data.durationunit || existingAppointment.durationunit,
//           visitortype: data.visitortype || existingAppointment.visitortype,
//           vehicletype: data.vehiclenumber !== undefined ? data.vehicletype : existingAppointment.vehicletype,
//           drivername: data.drivername || existingAppointment.drivername,
//           drivermobile: data.drivermobile || existingAppointment.drivermobile,
//           drivernationalid: data.drivernationalid || existingAppointment.drivernationalid,
//           driverphoto: data.driverphoto || existingAppointment.driverphoto,
//           isformcompleted: true,
//         });
//         console.log(`✅ Updated appointment for ${savedAppointment.email}, durationunit: ${savedAppointment.durationunit}`);
//         await this.visitorMailService.sendVisitorQRCode(savedAppointment);
//       } else {
//         const appointment = this.appointmentRepo.create({
//           firstname: data.firstname || '',
//           lastname: data.lastname || '',
//           contactnumber: data.contactnumber || '',
//           vehiclenumber: data.vehiclenumber || '',
//           gender: data.gender || '',
//           email: data.email,
//           date: data.date,
//           time: data.time ? data.time.split(':').slice(0, 2).join(':') : undefined,
//           nationalid: data.nationalid || '',
//           photo: data.photo || '',
//           notes: data.notes || '',
//           visit: data.visit || '',
//           personname: data.personname || '',
//           department: data.department || '',
//           durationtime: data.durationtime || '',
//           durationunit: data.durationunit || '',
//           visitortype: data.visitortype || '',
//           vehicletype: data.vehicletype || '',
//           drivername: data.drivername || '',
//           drivermobile: data.drivermobile || '',
//           drivernationalid: data.drivernationalid || '',
//           driverphoto: data.driverphoto || '',
//           isformcompleted: false,
//         });

//         savedAppointment = await this.appointmentRepo.save(appointment);
//         console.log('💾 Saved new appointment, durationunit:', savedAppointment.durationunit, JSON.stringify(savedAppointment, null, 2));

//         if (savedAppointment.email && savedAppointment.date && savedAppointment.time) {
//           const params = new URLSearchParams({
//             email: savedAppointment.email,
//             time: savedAppointment.time,
//             date: savedAppointment.date,
//             firstname: savedAppointment.firstname || '',
//             lastname: savedAppointment.lastname || '',
//             gender: savedAppointment.gender || '',
//             contactnumber: savedAppointment.contactnumber || '',
//           });
//           const formLink = `http://192.168.3.77:8000/visitorverify.html?${params.toString()}`;
//           await this.mailService.sendAppointmentEmail(
//             savedAppointment.email,
//             savedAppointment.date,
//             savedAppointment.time,
//             formLink,
//           );
//           console.log(`📩 Email sent to ${savedAppointment.email} with form link: ${formLink}`);
//         }
//       }

//       return savedAppointment;
//     } catch (error) {
//       console.error('❌ Error creating/updating appointment:', error);
//       if (error instanceof BadRequestException) {
//         throw error;
//       }
//       throw new InternalServerErrorException('Failed to create or update appointment: ' + error.message);
//     }
//   }

//   async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
//     const queryRunner = this.appointmentRepo.manager.connection.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const appointment = await queryRunner.manager.findOne(Appointment, { where: { id: Number(id) } });
//       if (!appointment) {
//         throw new BadRequestException(`Appointment with ID ${id} not found.`);
//       }

//       const updatedAppointment = await queryRunner.manager.save(Appointment, {
//         ...appointment,
//         firstname: data.firstname ?? appointment.firstname,
//         lastname: data.lastname ?? appointment.lastname,
//         contactnumber: data.contactnumber ?? appointment.contactnumber,
//         vehiclenumber: data.vehiclenumber ?? appointment.vehiclenumber,
//         gender: data.gender ?? appointment.gender,
//         email: data.email ?? appointment.email,
//         date: data.date ?? appointment.date,
//         time: data.time ?? appointment.time,
//         nationalid: data.nationalid ?? appointment.nationalid,
//         photo: data.photo ?? appointment.photo,
//         visit: data.visit ?? appointment.visit,
//         personname: data.personname ?? appointment.personname,
//         department: data.department ?? appointment.department,
//         durationtime: data.durationtime ?? appointment.durationtime,
//         durationunit: data.durationunit ?? appointment.durationunit,
//         visitortype: data.visitortype ?? appointment.visitortype,
//         vehicletype: data.vehicletype ?? appointment.vehicletype,
//         drivername: data.drivername ?? appointment.drivername,
//         drivermobile: data.drivermobile ?? appointment.drivermobile,
//         drivernationalid: data.drivernationalid ?? appointment.drivernationalid,
//         driverphoto: data.driverphoto ?? appointment.driverphoto,
//         notes: data.notes ?? appointment.notes,
//         isformcompleted: data.isformcompleted ?? appointment.isformcompleted,
//       });

//       await queryRunner.commitTransaction();
//       console.log('✅ Transaction committed, updated appointment, durationunit:', updatedAppointment.durationunit, JSON.stringify(updatedAppointment, null, 2));
//       await this.visitorMailService.sendVisitorQRCode(updatedAppointment);
//       return updatedAppointment;
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       console.error('❌ Error updating appointment, transaction rolled back:', error);
//       if (error instanceof BadRequestException) {
//         throw error;
//       }
//       throw new InternalServerErrorException('Failed to update appointment: ' + error.message);
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async checkFormStatus(email: string, date: string, time: string): Promise<boolean> {
//     try {
//       const appointment = await this.appointmentRepo.findOne({
//         where: { email, date, time },
//       });
//       console.log(`📋 Form status for ${email}, durationunit: ${appointment?.durationunit}`);
//       return appointment?.isformcompleted || false;
//     } catch (error) {
//       console.error('❌ Error checking form status:', error);
//       throw new InternalServerErrorException('Failed to check form status: ' + error.message);
//     }
//   }

//   async checkEmailExists(email: string): Promise<boolean> {
//     try {
//       const existingEmail = await this.appointmentRepo.findOne({
//         where: { email },
//       });
//       console.log(`📋 Email exists check for ${email}: ${!!existingEmail}`);
//       return !!existingEmail;
//     } catch (error) {
//       console.error('❌ Error checking email:', error);
//       throw new InternalServerErrorException('Failed to check email existence: ' + error.message);
//     }
//   }

//   async getAppointmentByContactNumber(contactnumber: string): Promise<Appointment> {
//     try {
//       const appointment = await this.appointmentRepo.findOne({
//         where: { contactnumber },
//         order: { id: 'DESC' },
//       });
//       if (!appointment) {
//         throw new BadRequestException(`Appointment with contactnumber ${contactnumber} not found.`);
//       }
//       console.log(`📋 Retrieved appointment for contactnumber ${contactnumber}, durationunit: ${appointment.durationunit}`);
//       return appointment;
//     } catch (error) {
//       console.error('❌ Error in getAppointmentByContactNumber:', error);
//       if (error instanceof BadRequestException) {
//         throw error;
//       }
//       throw new InternalServerErrorException('Failed to retrieve appointment: ' + error.message);
//     }
//   }

//   async getAllAppointments(pagination?: pagination): Promise<{ appointments: Appointment[], total: number }> {
//     try {
//       console.log('📋 Fetching appointments with pagination:', JSON.stringify(pagination, null, 2));
//       const query = this.appointmentRepo.createQueryBuilder('appointment');

//       if (pagination && pagination.page && pagination.limit) {
//         const page = pagination.page;
//         const limit = pagination.limit;
//         console.log(`📄 Applying pagination: page=${page}, limit=${limit}`);
//         query.skip((page - 1) * limit).take(limit);
//       } else {
//         console.log('📄 No pagination applied, fetching all appointments');
//       }

//       const [appointments, total] = await query.getManyAndCount();
//       console.log(`📋 Retrieved ${appointments.length} appointments, total: ${total}, durationunit sample: ${appointments[0]?.durationunit}`);
//       return { appointments, total };
//     } catch (error) {
//       console.error('❌ Error in getAllAppointments:', error);
//       throw new InternalServerErrorException('Failed to retrieve appointments: ' + error.message);
//     }
//   }

//   async getAppointmentsByEmail(email: string): Promise<Appointment[]> {
//     try {
//       const appointments = await this.appointmentRepo.find({ where: { email } });
//       console.log(`📋 Retrieved ${appointments.length} appointments for ${email}, durationunit sample: ${appointments[0]?.durationunit}`);
//       return appointments;
//     } catch (error) {
//       console.error('❌ Error in getAppointmentsByEmail:', error);
//       throw new InternalServerErrorException('Failed to retrieve appointments by email: ' + error.message);
//     }
//   }

//   async getAppointmentById(id: string): Promise<Appointment> {
//     try {
//       const appointment = await this.appointmentRepo.findOne({ where: { id: Number(id) } });
//       if (!appointment) {
//         throw new BadRequestException(`Appointment with ID ${id} not found.`);
//       }
//       console.log(`📋 Retrieved appointment ID ${id}, durationunit: ${appointment.durationunit}`);
//       return appointment;
//     } catch (error) {
//       console.error('❌ Error in getAppointmentById:', error);
//       if (error instanceof BadRequestException) {
//         throw error;
//       }
//       throw new InternalServerErrorException('Failed to retrieve appointment: ' + error.message);
//     }
//   }

//   async updateGatepassStatus(id: string, gatepassApproved: boolean): Promise<Appointment> {
//     const queryRunner = this.appointmentRepo.manager.connection.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const appointment = await queryRunner.manager.findOne(Appointment, { where: { id: Number(id) } });
//       if (!appointment) {
//         throw new BadRequestException(`Appointment with ID ${id} not found.`);
//       }

//       const updatedAppointment = await queryRunner.manager.save(Appointment, {
//         ...appointment,
//         gatepassApproved: gatepassApproved,
//       });

//       await queryRunner.commitTransaction();
//       console.log('✅ Transaction committed, updated gatepass status, durationunit:', updatedAppointment.durationunit, JSON.stringify(updatedAppointment, null, 2));
//       return updatedAppointment;
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       console.error('❌ Error updating gatepass status, transaction rolled back:', error);
//       if (error instanceof BadRequestException) {
//         throw error;
//       }
//       throw new InternalServerErrorException('Failed to update gatepass status: ' + error.message);
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async updateNdaStatus(email: string, date: string, time: string, ndaApproved: boolean): Promise<Appointment> {
//     const queryRunner = this.appointmentRepo.manager.connection.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const appointment = await queryRunner.manager.findOne(Appointment, {
//         where: { email, date, time },
//       });
//       if (!appointment) {
//         throw new BadRequestException(`Appointment with email ${email}, date ${date}, time ${time} not found.`);
//       }

//       const updatedAppointment = await queryRunner.manager.save(Appointment, {
//         ...appointment,
//         ndaApproved: ndaApproved,
//       });

//       await queryRunner.commitTransaction();
//       console.log('✅ Transaction committed, updated NDA status, ndaApproved:', updatedAppointment.ndaApproved, JSON.stringify(updatedAppointment, null, 2));
//       return updatedAppointment;
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       console.error('❌ Error updating NDA status, transaction rolled back:', error);
//       if (error instanceof BadRequestException) {
//         throw error;
//       }
//       throw new InternalServerErrorException('Failed to update NDA status: ' + error.message);
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async updateSafetyStatus(email: string, date: string, time: string, SaftyApproval: boolean): Promise<Appointment> {
//     const queryRunner = this.appointmentRepo.manager.connection.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const appointment = await queryRunner.manager.findOne(Appointment, {
//         where: { email, date, time },
//       });
//       if (!appointment) {
//         throw new BadRequestException(`Appointment with email ${email}, date ${date}, time ${time} not found.`);
//       }

//       const updatedAppointment = await queryRunner.manager.save(Appointment, {
//         ...appointment,
//         SaftyApproval: SaftyApproval,
//       });

//       await queryRunner.commitTransaction();
//       console.log('✅ Transaction committed, updated safety acknowledgment status, SaftyApproval:', updatedAppointment.SaftyApproval, JSON.stringify(updatedAppointment, null, 2));
//       return updatedAppointment;
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       console.error('❌ Error updating safety acknowledgment status, transaction rolled back:', error);
//       if (error instanceof BadRequestException) {
//         throw error;
//       }
//       throw new InternalServerErrorException('Failed to update safety acknowledgment status: ' + error.message);
//     } finally {
//       await queryRunner.release();
//     }
//   }
// }
import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { MailService } from '../mail/mail.service';
import { VisitorMailService } from './visitor-mail/visitor-mail.service';
import { pagination } from '../appointment/appointment_dto/pagination.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    private readonly mailService: MailService,
    private readonly visitorMailService: VisitorMailService,
  ) { }

  async createOrUpdateAppointment(data: Partial<Appointment>): Promise<Appointment> {
    try {
      console.log('📥 Incoming appointment data:', JSON.stringify(data, null, 2));

      if (!data.email || !data.date || !data.time) {
        throw new BadRequestException('Missing required fields: email, date, time');
      }

      // Additional safeguard: ensure personname and department are strings
      if (Array.isArray(data.personname)) {
        console.warn('⚠️ personname is an array in service:', data.personname);
        data.personname = data.personname.length > 0 ? data.personname[0] : '';
      }
      if (Array.isArray(data.department)) {
        console.warn('⚠️ department is an array in service:', data.department);
        data.department = data.department.length > 0 ? data.department[0] : '';
      }

      const existingAppointment = await this.appointmentRepo.findOne({
        where: {
          email: data.email,
          date: data.date,
          time: data.time,
        },
      });

      let savedAppointment: Appointment;

      if (existingAppointment) {
        savedAppointment = await this.appointmentRepo.save({
          ...existingAppointment,
          firstname: data.firstname !== undefined ? data.firstname : existingAppointment.firstname,
          lastname: data.lastname !== undefined ? data.lastname : existingAppointment.lastname,
          contactnumber: data.contactnumber !== undefined ? data.contactnumber : existingAppointment.contactnumber,
          vehiclenumber: data.vehiclenumber !== undefined ? data.vehiclenumber : existingAppointment.vehiclenumber,
          nationalid: data.nationalid || existingAppointment.nationalid,
          photo: data.photo || existingAppointment.photo,
          gender: data.gender || existingAppointment.gender,
          notes: data.notes || existingAppointment.notes,
          visit: data.visit || existingAppointment.visit,
          personname: data.personname || existingAppointment.personname,
          department: data.department || existingAppointment.department,
          durationtime: data.durationtime || existingAppointment.durationtime,
          durationunit: data.durationunit || existingAppointment.durationunit,
          visitortype: data.visitortype || existingAppointment.visitortype,
          vehicletype: data.vehiclenumber !== undefined ? data.vehicletype : existingAppointment.vehicletype,
          drivername: data.drivername || existingAppointment.drivername,
          drivermobile: data.drivermobile || existingAppointment.drivermobile,
          drivernationalid: data.drivernationalid || existingAppointment.drivernationalid,
          driverphoto: data.driverphoto || existingAppointment.driverphoto,
          isformcompleted: true,
        });
        console.log(`✅ Updated appointment for ${savedAppointment.email}, durationunit: ${savedAppointment.durationunit}`);
        await this.visitorMailService.sendVisitorQRCode(savedAppointment);
      } else {
        const appointment = this.appointmentRepo.create({
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          contactnumber: data.contactnumber || '',
          vehiclenumber: data.vehiclenumber || '',
          gender: data.gender || '',
          email: data.email,
          date: data.date,
          time: data.time ? data.time.split(':').slice(0, 2).join(':') : undefined,
          nationalid: data.nationalid || '',
          photo: data.photo || '',
          notes: data.notes || '',
          visit: data.visit || '',
          personname: data.personname || '',
          department: data.department || '',
          durationtime: data.durationtime || '',
          durationunit: data.durationunit || '',
          visitortype: data.visitortype || '',
          vehicletype: data.vehicletype || '',
          drivername: data.drivername || '',
          drivermobile: data.drivermobile || '',
          drivernationalid: data.drivernationalid || '',
          driverphoto: data.driverphoto || '',
          isformcompleted: false,
        });

        savedAppointment = await this.appointmentRepo.save(appointment);
        console.log('💾 Saved new appointment, durationunit:', savedAppointment.durationunit, JSON.stringify(savedAppointment, null, 2));

        if (savedAppointment.email && savedAppointment.date && savedAppointment.time) {
          const params = new URLSearchParams({
            email: savedAppointment.email,
            time: savedAppointment.time,
            date: savedAppointment.date,
            firstname: savedAppointment.firstname || '',
            lastname: savedAppointment.lastname || '',
            gender: savedAppointment.gender || '',
            contactnumber: savedAppointment.contactnumber || '',
          });
          const formLink = `http://192.168.3.77:8000/visitorverify.html?${params.toString()}`;
          await this.mailService.sendAppointmentEmail(
            savedAppointment.email,
            savedAppointment.date,
            savedAppointment.time,
            formLink,
          );
          console.log(`📩 Email sent to ${savedAppointment.email} with form link: ${formLink}`);
        }
      }

      return savedAppointment;
    } catch (error) {
      console.error('❌ Error creating/updating appointment:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create or update appointment: ' + error.message);
    }
  }

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    const queryRunner = this.appointmentRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const appointment = await queryRunner.manager.findOne(Appointment, { where: { id: Number(id) } });
      if (!appointment) {
        throw new BadRequestException(`Appointment with ID ${id} not found.`);
      }

      const updatedAppointment = await queryRunner.manager.save(Appointment, {
        ...appointment,
        firstname: data.firstname ?? appointment.firstname,
        lastname: data.lastname ?? appointment.lastname,
        contactnumber: data.contactnumber ?? appointment.contactnumber,
        vehiclenumber: data.vehiclenumber ?? appointment.vehiclenumber,
        gender: data.gender ?? appointment.gender,
        email: data.email ?? appointment.email,
        date: data.date ?? appointment.date,
        time: data.time ?? appointment.time,
        nationalid: data.nationalid ?? appointment.nationalid,
        photo: data.photo ?? appointment.photo,
        visit: data.visit ?? appointment.visit,
        personname: data.personname ?? appointment.personname,
        department: data.department ?? appointment.department,
        durationtime: data.durationtime ?? appointment.durationtime,
        durationunit: data.durationunit ?? appointment.durationunit,
        visitortype: data.visitortype ?? appointment.visitortype,
        vehicletype: data.vehicletype ?? appointment.vehicletype,
        drivername: data.drivername ?? appointment.drivername,
        drivermobile: data.drivermobile ?? appointment.drivermobile,
        drivernationalid: data.drivernationalid ?? appointment.drivernationalid,
        driverphoto: data.driverphoto ?? appointment.driverphoto,
        notes: data.notes ?? appointment.notes,
        isformcompleted: data.isformcompleted ?? appointment.isformcompleted,
      });

      await queryRunner.commitTransaction();
      console.log('✅ Transaction committed, updated appointment, durationunit:', updatedAppointment.durationunit, JSON.stringify(updatedAppointment, null, 2));
      await this.visitorMailService.sendVisitorQRCode(updatedAppointment);
      return updatedAppointment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error updating appointment, transaction rolled back:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update appointment: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async checkFormStatus(email: string, date: string, time: string): Promise<boolean> {
    try {
      const appointment = await this.appointmentRepo.findOne({
        where: { email, date, time },
      });
      console.log(`📋 Form status for ${email}, durationunit: ${appointment?.durationunit}`);
      return appointment?.isformcompleted || false;
    } catch (error) {
      console.error('❌ Error checking form status:', error);
      throw new InternalServerErrorException('Failed to check form status: ' + error.message);
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const existingEmail = await this.appointmentRepo.findOne({
        where: { email },
      });
      console.log(`📋 Email exists check for ${email}: ${!!existingEmail}`);
      return !!existingEmail;
    } catch (error) {
      console.error('❌ Error checking email:', error);
      throw new InternalServerErrorException('Failed to check email existence: ' + error.message);
    }
  }

  async getAppointmentByContactNumber(contactnumber: string): Promise<Appointment> {
    try {
      const appointment = await this.appointmentRepo.findOne({
        where: { contactnumber },
        order: { id: 'DESC' },
      });
      if (!appointment) {
        throw new BadRequestException(`Appointment with contactnumber ${contactnumber} not found.`);
      }
      console.log(`📋 Retrieved appointment for contactnumber ${contactnumber}, durationunit: ${appointment.durationunit}`);
      return appointment;
    } catch (error) {
      console.error('❌ Error in getAppointmentByContactNumber:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve appointment: ' + error.message);
    }
  }

  async getAllAppointments(pagination?: pagination): Promise<{ appointments: Appointment[], total: number }> {
    try {
      console.log('📋 Fetching appointments with pagination:', JSON.stringify(pagination, null, 2));
      const query = this.appointmentRepo.createQueryBuilder('appointment');

      if (pagination && pagination.page && pagination.limit) {
        const page = pagination.page;
        const limit = pagination.limit;
        console.log(`📄 Applying pagination: page=${page}, limit=${limit}`);
        query.skip((page - 1) * limit).take(limit);
      } else {
        console.log('📄 No pagination applied, fetching all appointments');
      }

      const [appointments, total] = await query.getManyAndCount();
      console.log(`📋 Retrieved ${appointments.length} appointments, total: ${total}, durationunit sample: ${appointments[0]?.durationunit}`);
      return { appointments, total };
    } catch (error) {
      console.error('❌ Error in getAllAppointments:', error);
      throw new InternalServerErrorException('Failed to retrieve appointments: ' + error.message);
    }
  }

  async getAppointmentsByEmail(email: string): Promise<Appointment[]> {
    try {
      const appointments = await this.appointmentRepo.find({ where: { email } });
      console.log(`📋 Retrieved ${appointments.length} appointments for ${email}, durationunit sample: ${appointments[0]?.durationunit}`);
      return appointments;
    } catch (error) {
      console.error('❌ Error in getAppointmentsByEmail:', error);
      throw new InternalServerErrorException('Failed to retrieve appointments by email: ' + error.message);
    }
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    try {
      const appointment = await this.appointmentRepo.findOne({ where: { id: Number(id) } });
      if (!appointment) {
        throw new BadRequestException(`Appointment with ID ${id} not found.`);
      }
      console.log(`📋 Retrieved appointment ID ${id}, durationunit: ${appointment.durationunit}`);
      return appointment;
    } catch (error) {
      console.error('❌ Error in getAppointmentById:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve appointment: ' + error.message);
    }
  }

  async updateGatepassStatus(id: string, gatepassApproved: boolean): Promise<Appointment> {
    const queryRunner = this.appointmentRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const appointment = await queryRunner.manager.findOne(Appointment, { where: { id: Number(id) } });
      if (!appointment) {
        throw new BadRequestException(`Appointment with ID ${id} not found.`);
      }

      const updatedAppointment = await queryRunner.manager.save(Appointment, {
        ...appointment,
        gatepassApproved: gatepassApproved,
      });

      await queryRunner.commitTransaction();
      console.log('✅ Transaction committed, updated gatepass status, durationunit:', updatedAppointment.durationunit, JSON.stringify(updatedAppointment, null, 2));
      return updatedAppointment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error updating gatepass status, transaction rolled back:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update gatepass status: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updateNdaStatus(email: string, date: string, time: string, ndaApproved: boolean): Promise<Appointment> {
    const queryRunner = this.appointmentRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const appointment = await queryRunner.manager.findOne(Appointment, {
        where: { email, date, time },
      });
      if (!appointment) {
        throw new BadRequestException(`Appointment with email ${email}, date ${date}, time ${time} not found.`);
      }

      const updatedAppointment = await queryRunner.manager.save(Appointment, {
        ...appointment,
        ndaApproved: ndaApproved,
      });

      await queryRunner.commitTransaction();
      console.log('✅ Transaction committed, updated NDA status, ndaApproved:', updatedAppointment.ndaApproved, JSON.stringify(updatedAppointment, null, 2));
      return updatedAppointment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error updating NDA status, transaction rolled back:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update NDA status: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updateSafetyStatus(email: string, date: string, time: string, SaftyApproval: boolean): Promise<Appointment> {
    const queryRunner = this.appointmentRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const appointment = await queryRunner.manager.findOne(Appointment, {
        where: { email, date, time },
      });
      if (!appointment) {
        throw new BadRequestException(`Appointment with email ${email}, date ${date}, time ${time} not found.`);
      }

      const updatedAppointment = await queryRunner.manager.save(Appointment, {
        ...appointment,
        SaftyApproval: SaftyApproval,
      });

      await queryRunner.commitTransaction();
      console.log('✅ Transaction committed, updated safety acknowledgment status, SaftyApproval:', updatedAppointment.SaftyApproval, JSON.stringify(updatedAppointment, null, 2));
      return updatedAppointment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error updating safety acknowledgment status, transaction rolled back:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update safety acknowledgment status: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }
}