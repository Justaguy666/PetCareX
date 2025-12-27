import { BadRequestError } from '../../errors/app.error.js';
import petService from './pet.service.js';

class PetController {
    getPets = async (req, res, next) => {
      try {
        const { page = '1', pageSize = '10', keyword = '' } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const sizeNum = Math.max(1, parseInt(pageSize, 10) || 10);

        const result = await petService.getPets({ page: pageNum, pageSize: sizeNum, keyword });

        return res.status(200).json({ data: result.data, meta: result.meta });
      } catch (err) {
        next(err);
      }
    };

    getPetById = async (req, res, next) => {
      try {
        const { petId } = req.params;

        if (!petId) {
          throw new BadRequestError('Pet ID is required');
        }

        const result = await petService.getPetById(petId);
        
        return res.status(200).json({ data: result });
      } catch (err) {
        next(err);
      }
    };
}

export default new PetController();