import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visitor } from './visitor.entity';
import { CreateVisitorDto } from './CreateVisitor.dto';
import { VisitorMailService } from './mail/visitormail.service';

@Injectable()
export class VisitorService {
  constructor(
    @InjectRepository(Visitor)
    private visitorRepository: Repository<Visitor>,
    private visitorMailService: VisitorMailService,
  ) { }

  async create(visitor: Partial<Visitor>): Promise<Visitor> {
    console.log('Received visitor data:', visitor);

    // Convert DD-MM-YYYY to YYYY-MM-DD
    if (visitor.date && visitor.date.includes('-')) {
      const parts = visitor.date.split('-');
      if (parts.length === 3 && parts[0].length === 2) {
        visitor.date = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // Explicitly preserve durationunit and boolean fields
    if (visitor.durationunit === '') {
      visitor.durationunit = undefined;
    }

    // Remove undefined/null/empty fields, except durationunit and boolean fields
    const cleanedData = Object.entries(visitor).reduce((acc, [key, value]) => {
      if (key === 'durationunit' || ['isApproved', 'inprogress', 'complete', 'exit'].includes(key) || (value !== undefined && value !== null && value !== '')) {
        acc[key] = value;
      }
      return acc;
    }, {} as Partial<Visitor>);

    console.log('Cleaned data:', cleanedData);

    const newVisitor = this.visitorRepository.create(cleanedData);
    const savedVisitor = await this.visitorRepository.save(newVisitor);

    try {
      await this.visitorMailService.sendVisitorQRCode(savedVisitor);
    } catch (error) {
      console.error('Email sending failed:', error);
    }

    return savedVisitor;
  }

  async findAll(): Promise<Visitor[]> {
    return this.visitorRepository.find();
  }

  async findOne(id: number): Promise<Visitor> {
    const visitor = await this.visitorRepository.findOne({ where: { id } });
    if (!visitor) {
      throw new NotFoundException(`Visitor with id ${id} not found`);
    }
    return visitor;
  }

  async update(id: number, body: Partial<CreateVisitorDto>): Promise<Visitor> {
    const visitor = await this.visitorRepository.findOne({ where: { id } });
    if (!visitor) {
      throw new NotFoundException(`Visitor with id ${id} not found`);
    }

    // Convert DD-MM-YYYY to YYYY-MM-DD for date if provided
    if (body.date && body.date.includes('-')) {
      const parts = body.date.split('-');
      if (parts.length === 3 && parts[0].length === 2) {
        body.date = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // Explicitly preserve durationunit
    if (body.durationunit === '') {
      body.durationunit = undefined;
    }

    // Clean the data: remove undefined/null/empty fields, except durationunit and boolean fields
    const cleanedData = Object.entries(body).reduce((acc, [key, value]) => {
      if (key === 'durationunit' || ['isApproved', 'inprogress', 'complete', 'exit'].includes(key) || (value !== undefined && value !== null && value !== '')) {
        acc[key] = value;
      }
      return acc;
    }, {} as Partial<Visitor>);

    console.log('Cleaned update data:', cleanedData);

    // Merge updated data with existing visitor
    const updated = Object.assign(visitor, cleanedData);
    const savedVisitor = await this.visitorRepository.save(updated);

    // Send updated QR code email
    try {
      await this.visitorMailService.sendVisitorQRCode(savedVisitor);
      console.log(`Updated QR code email sent for visitor ID: ${savedVisitor.id}`);
    } catch (error) {
      console.error('Failed to send updated QR code email:', error);
    }

    return savedVisitor;
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.visitorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Visitor with id ${id} not found`);
    }
    return { message: `Visitor with id ${id} deleted successfully` };
  }

  async findByNationalId(nationalid: string): Promise<Visitor> {
    const visitor = await this.visitorRepository.findOne({ where: { nationalid } });
    if (!visitor) {
      throw new NotFoundException(`Visitor with national ID ${nationalid} not found`);
    }
    return visitor;
  }

  async updateStatus(id: number, status: string): Promise<Visitor> {
    const visitor = await this.visitorRepository.findOne({ where: { id } });
    if (!visitor) {
      throw new NotFoundException(`Visitor with id ${id} not found`);
    }

    console.log('Updating status for visitor:', id, 'to:', status);

    // Update the relevant status field without resetting others
    switch (status.toLowerCase()) {
      case 'approve':
        visitor.isApproved = true;
        visitor.inprogress = true; // Set inprogress to true when approved
        break;
      case 'disapprove':
        visitor.isApproved = false;
        break;
      case 'inprogress':
        visitor.inprogress = true;
        break;
      case 'complete':
        visitor.complete = true;
        break;
      case 'exit':
        visitor.exit = true;
        break;
      default:
        throw new BadRequestException(`Invalid status: ${status}`);
    }

    const savedVisitor = await this.visitorRepository.save(visitor);
    console.log('Saved visitor with updated status:', savedVisitor);

    return savedVisitor;
  }
}