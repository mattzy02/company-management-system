import { Controller, Get, Post, Body, Put, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { FilterAccountDto } from './dto/filter-account.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Accounts')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or account number already exists' })
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }

  @Post('filter')
  @ApiOperation({ summary: 'Filter accounts based on criteria' })
  @ApiResponse({ status: 200, description: 'Accounts filtered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  filterAccounts(@Body() filterAccountDto: FilterAccountDto) {
    return this.accountService.filterAccounts(filterAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({ status: 200, description: 'All accounts retrieved successfully' })
  findAll() {
    return this.accountService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get account statistics' })
  @ApiResponse({ status: 200, description: 'Account statistics retrieved successfully' })
  getStats() {
    return this.accountService.getAccountStats();
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: 'Get account statistics for a specific user' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User account statistics retrieved successfully' })
  getUserStats(@Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string) {
    return this.accountService.getAccountStats(userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all accounts for a specific user' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User accounts retrieved successfully' })
  findByUser(@Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string) {
    return this.accountService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiResponse({ status: 200, description: 'Account retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.accountService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account by ID' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or account number already exists' })
  update(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete account by ID' })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.accountService.remove(id);
  }
}
