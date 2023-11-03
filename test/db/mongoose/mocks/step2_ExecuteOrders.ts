import type { IDaoFactory, IMinimalId } from "../../../../src";
import { BaseService } from "../../../../src";
import { ObjectId } from "../../../service/mocks/BaseService.mocks";

class Service<K extends IMinimalId> extends BaseService<K> {}

export async function prefillOrdersForTests(daoFactory: IDaoFactory<ObjectId>) {
  const offerDao = daoFactory.getOfferDao();
  const { allOffers, vipEventTalkOfferGroups, vipSeoBackLinkOfferGroups } =
    await prefillOffersForTests(daoFactory);

  const service = new Service<ObjectId>(daoFactory as IDaoFactory<IMinimalId>);
  service.createOrder( )
}
